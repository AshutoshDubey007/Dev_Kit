export interface PromptVariable {
  name: string;
  label: string;
  description?: string;
  placeholder: string;
  defaultValue?: string;
  required: boolean;
}

export interface PromptItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  problemSolves: string;
  category: 'saas' | 'auth' | 'payments' | 'ai' | 'dashboard' | 'api' | 'mobile' | 'devops';
  authorUsername: string;
  authorName: string;
  authorAvatar?: string;
  supportedModels: string[];
  supportedFrameworks: string[];
  requiredVariables: PromptVariable[];
  templateContent: string;
  sampleInput: Record<string, string>;
  sampleOutput: string;
  priceINR: number;
  priceUSD: number;
  isPaid: boolean;
  rating: number;
  reviewCount: number;
  salesCount: number;
  version: string;
  license: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}
