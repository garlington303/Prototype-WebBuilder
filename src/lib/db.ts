/**
 * IndexedDB Database Schema with Dexie.js
 * Client-side storage for conversations, messages, and usage tracking
 */

import Dexie, { Table } from 'dexie';
import { AIAction, AIProvider } from './ai-service';

// ============================================
// INTERFACES
// ============================================

export interface ImageData {
  data: string; // base64
  mimeType: 'image/png' | 'image/jpeg';
  name?: string;
  fileSize?: number;
}

export interface MessageUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number; // USD
}

export interface ConversationMessage {
  id?: number; // Auto-incremented
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  images?: ImageData[];
  actions?: AIAction[];
  usage?: MessageUsage;
  status?: 'pending' | 'success' | 'error';
}

export interface Conversation {
  id?: string; // Primary key
  title: string;
  state: 'active' | 'archived' | 'deleted';
  createdAt: number;
  updatedAt: number;
  lastAccessedAt: number;
  archivedAt?: number;
  // Statistics
  messageCount: number;
  totalTokens: number;
  totalCost: number;
  // Provider info
  primaryProvider?: AIProvider;
  primaryModel?: string;
}

export interface UsageRecord {
  id?: number; // Auto-incremented
  timestamp: number;
  provider: AIProvider;
  model: string;
  conversationId?: string;
  messageId?: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number; // USD
  imageCount: number;
  success: boolean;
  errorMessage?: string;
}

export interface UserSettings {
  key: string; // Primary key
  value: any;
}

// ============================================
// PRICING DATA (Per 1K tokens)
// ============================================

export const PRICING = {
  claude: {
    'claude-sonnet-4-20250514': { input: 0.003, output: 0.015 },
    'claude-3-5-sonnet-20240620': { input: 0.003, output: 0.015 },
    'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
    'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
  },
  gemini: {
    'gemini-2.0-flash': { input: 0.00010, output: 0.00040 },
    'gemini-2.0-flash-lite': { input: 0.000075, output: 0.0003 },
    'gemini-1.5-pro': { input: 0.00125, output: 0.005 },
    'gemini-1.5-flash': { input: 0.000075, output: 0.0003 },
  },
  ollama: {
    '*': { input: 0, output: 0 }, // Free (local)
  },
} as const;

// ============================================
// DATABASE CLASS
// ============================================

export class AetheriaDB extends Dexie {
  conversations!: Table<Conversation, string>;
  messages!: Table<ConversationMessage, number>;
  usage!: Table<UsageRecord, number>;
  settings!: Table<UserSettings, string>;

  constructor() {
    super('AetheriaBuilder');
    
    this.version(1).stores({
      // Primary key, then indexes
      conversations: 'id, state, createdAt, updatedAt, lastAccessedAt, archivedAt',
      messages: '++id, conversationId, timestamp, role',
      usage: '++id, timestamp, provider, conversationId, [provider+timestamp]',
      settings: 'key',
    });
  }
}

// ============================================
// DATABASE INSTANCE
// ============================================

export const db = new AetheriaDB();

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate estimated cost for a request
 */
export function calculateCost(
  provider: AIProvider,
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const providerPricing = PRICING[provider] || PRICING.ollama;
  const modelPricing = (providerPricing as any)[model] || (providerPricing as any)['*'] || { input: 0, output: 0 };
  
  const inputCost = (inputTokens / 1000) * modelPricing.input;
  const outputCost = (outputTokens / 1000) * modelPricing.output;
  
  return Math.round((inputCost + outputCost) * 10000) / 10000; // Round to 4 decimal places
}

/**
 * Estimate tokens from text (rough approximation)
 * Claude: ~4 chars per token, GPT/Gemini: ~3.5 chars per token
 */
export function estimateTokens(text: string, provider: AIProvider = 'claude'): number {
  if (!text) return 0;
  const charsPerToken = provider === 'gemini' ? 3.5 : 4;
  return Math.ceil(text.length / charsPerToken);
}

/**
 * Generate a unique conversation ID
 */
export function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format cost for display
 */
export function formatCost(cost: number): string {
  if (cost < 0.01) {
    return `<$0.01`;
  }
  return `$${cost.toFixed(2)}`;
}

/**
 * Format tokens for display
 */
export function formatTokens(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return tokens.toString();
}

// ============================================
// SETTINGS HELPERS
// ============================================

export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  const record = await db.settings.get(key);
  return record?.value ?? defaultValue;
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  await db.settings.put({ key, value });
}

// ============================================
// USAGE STATISTICS
// ============================================

export interface UsageStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  byProvider: Record<string, {
    requests: number;
    tokens: number;
    cost: number;
  }>;
  thisMonth: {
    requests: number;
    tokens: number;
    cost: number;
  };
  today: {
    requests: number;
    tokens: number;
    cost: number;
  };
}

export async function getUsageStats(): Promise<UsageStats> {
  const now = Date.now();
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
  
  const allUsage = await db.usage.toArray();
  const monthUsage = allUsage.filter(u => u.timestamp >= startOfMonth);
  const dayUsage = allUsage.filter(u => u.timestamp >= startOfDay);
  
  const byProvider: Record<string, { requests: number; tokens: number; cost: number }> = {};
  
  for (const record of allUsage) {
    if (!byProvider[record.provider]) {
      byProvider[record.provider] = { requests: 0, tokens: 0, cost: 0 };
    }
    byProvider[record.provider].requests++;
    byProvider[record.provider].tokens += record.totalTokens;
    byProvider[record.provider].cost += record.estimatedCost;
  }
  
  return {
    totalRequests: allUsage.length,
    totalTokens: allUsage.reduce((sum, u) => sum + u.totalTokens, 0),
    totalCost: allUsage.reduce((sum, u) => sum + u.estimatedCost, 0),
    byProvider,
    thisMonth: {
      requests: monthUsage.length,
      tokens: monthUsage.reduce((sum, u) => sum + u.totalTokens, 0),
      cost: monthUsage.reduce((sum, u) => sum + u.estimatedCost, 0),
    },
    today: {
      requests: dayUsage.length,
      tokens: dayUsage.reduce((sum, u) => sum + u.totalTokens, 0),
      cost: dayUsage.reduce((sum, u) => sum + u.estimatedCost, 0),
    },
  };
}
