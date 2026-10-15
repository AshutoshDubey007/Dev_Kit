/**
 * Master DevKit Production Test Suite Entry Point
 * Executes all security, compliance, payment, authorization, data, and configuration tests.
 */
import './security/scanner.test';
import './security/dlp-chat-filter.test';
import './payments/razorpay-verification.test';
import './auth/rbac-permissions.test';
import './data/marketplace-integrity.test';
import './data/kits-authoritative.test';
import './admin/admin-metrics.test';
import './projects/tasks-discussions.test';
import './studio/studio-provider.test';
import './config/environment.test';
import './verifications/product-verifications.test';
import './support/support-tickets-lifecycle.test';

