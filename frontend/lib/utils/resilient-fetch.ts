/**
 * DevKit Production Resilient Fetch Utility
 * 
 * Provides:
 * - Explicit request timeouts with AbortSignal
 * - Bounded retries for transient network/5xx failures
 * - Exponential backoff with jitter
 * - Error classification (never retries permanent 4xx errors)
 * - Circuit breaker protection to prevent cascade failures
 */

export interface ResilientFetchOptions extends RequestInit {
  timeoutMs?: number;
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  serviceName?: string;
}

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  isOpen: boolean;
}

const circuitBreakers = new Map<string, CircuitBreakerState>();
const FAILURE_THRESHOLD = 5;
const RESET_TIMEOUT_MS = 30000; // 30 seconds cooldown

function getCircuitBreaker(service: string): CircuitBreakerState {
  let cb = circuitBreakers.get(service);
  if (!cb) {
    cb = { failures: 0, lastFailureTime: 0, isOpen: false };
    circuitBreakers.set(service, cb);
  }
  // Check if cooldown elapsed
  if (cb.isOpen && Date.now() - cb.lastFailureTime > RESET_TIMEOUT_MS) {
    cb.isOpen = false;
    cb.failures = 0;
  }
  return cb;
}

function recordSuccess(service: string) {
  const cb = circuitBreakers.get(service);
  if (cb) {
    cb.failures = 0;
    cb.isOpen = false;
  }
}

function recordFailure(service: string) {
  const cb = getCircuitBreaker(service);
  cb.failures += 1;
  cb.lastFailureTime = Date.now();
  if (cb.failures >= FAILURE_THRESHOLD) {
    cb.isOpen = true;
    console.warn(`[CircuitBreaker] Circuit opened for service: ${service} due to ${cb.failures} consecutive failures.`);
  }
}

/**
 * Resilient fetch implementation with timeout, exponential backoff, and circuit breaker.
 */
export async function resilientFetch(
  url: string,
  options: ResilientFetchOptions = {}
): Promise<Response> {
  const {
    timeoutMs = 8000,
    maxRetries = 2,
    baseDelayMs = 300,
    maxDelayMs = 3000,
    serviceName = new URL(url).hostname,
    ...fetchInit
  } = options;

  const cb = getCircuitBreaker(serviceName);
  if (cb.isOpen) {
    throw new Error(
      `Service '${serviceName}' is temporarily unavailable (circuit breaker open). Please retry in 30 seconds.`
    );
  }

  let attempt = 0;
  let lastError: any = null;

  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchInit,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Treat 500, 502, 503, 504 as transient errors eligible for retry
      if (response.status >= 500 && attempt < maxRetries) {
        lastError = new Error(`Server returned HTTP ${response.status}`);
        recordFailure(serviceName);
      } else {
        // Success or permanent 4xx (client error should not be retried)
        recordSuccess(serviceName);
        return response;
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;
      recordFailure(serviceName);

      // If aborted due to timeout
      if (err.name === 'AbortError') {
        lastError = new Error(`Request to ${serviceName} timed out after ${timeoutMs}ms`);
      }

      // If last attempt, throw
      if (attempt >= maxRetries) {
        break;
      }
    }

    attempt++;

    // Calculate exponential backoff with jitter: baseDelay * 2^(attempt - 1) + random jitter
    const exponentialDelay = baseDelayMs * Math.pow(2, attempt - 1);
    const jitter = Math.floor(Math.random() * 100);
    const delay = Math.min(maxDelayMs, exponentialDelay + jitter);

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  throw lastError || new Error(`Request to ${url} failed after ${maxRetries} retries`);
}
