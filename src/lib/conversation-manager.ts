/**
 * Conversation Manager
 * Handles conversation lifecycle with 3-active limit and auto-archiving
 */

import { 
  db, 
  Conversation, 
  ConversationMessage, 
  UsageRecord,
  generateConversationId, 
  calculateCost, 
  estimateTokens 
} from './db';
import { AIProvider, getAIProvider } from './ai-service';

// ============================================
// CONSTANTS
// ============================================

export const MAX_ACTIVE_CONVERSATIONS = 3;

// ============================================
// CONVERSATION CRUD
// ============================================

/**
 * Create a new conversation, auto-archiving oldest if at limit
 */
export async function createConversation(title: string = 'New Conversation'): Promise<Conversation> {
  const activeConvos = await db.conversations
    .where('state')
    .equals('active')
    .sortBy('lastAccessedAt');
  
  // Auto-archive oldest if at limit
  if (activeConvos.length >= MAX_ACTIVE_CONVERSATIONS) {
    const oldest = activeConvos[0];
    await archiveConversation(oldest.id!);
  }
  
  const now = Date.now();
  const conversation: Conversation = {
    id: generateConversationId(),
    title,
    state: 'active',
    createdAt: now,
    updatedAt: now,
    lastAccessedAt: now,
    messageCount: 0,
    totalTokens: 0,
    totalCost: 0,
    primaryProvider: getAIProvider(),
  };
  
  await db.conversations.add(conversation);
  return conversation;
}

/**
 * Get all active conversations
 */
export async function getActiveConversations(): Promise<Conversation[]> {
  return db.conversations
    .where('state')
    .equals('active')
    .reverse()
    .sortBy('lastAccessedAt');
}

/**
 * Get all archived conversations
 */
export async function getArchivedConversations(): Promise<Conversation[]> {
  return db.conversations
    .where('state')
    .equals('archived')
    .reverse()
    .sortBy('archivedAt');
}

/**
 * Get a single conversation by ID
 */
export async function getConversation(id: string): Promise<Conversation | undefined> {
  return db.conversations.get(id);
}

/**
 * Update conversation and mark as accessed
 */
export async function updateConversation(
  id: string, 
  updates: Partial<Omit<Conversation, 'id'>>
): Promise<void> {
  await db.conversations.update(id, {
    ...updates,
    updatedAt: Date.now(),
    lastAccessedAt: Date.now(),
  });
}

/**
 * Update conversation title
 */
export async function renameConversation(id: string, title: string): Promise<void> {
  await updateConversation(id, { title });
}

/**
 * Archive a conversation
 */
export async function archiveConversation(id: string): Promise<void> {
  await db.conversations.update(id, {
    state: 'archived',
    archivedAt: Date.now(),
    updatedAt: Date.now(),
  });
}

/**
 * Restore an archived conversation to active
 * Will auto-archive oldest active if at limit
 */
export async function restoreConversation(id: string): Promise<void> {
  const activeConvos = await getActiveConversations();
  
  // Auto-archive oldest if at limit
  if (activeConvos.length >= MAX_ACTIVE_CONVERSATIONS) {
    const oldest = activeConvos[activeConvos.length - 1];
    await archiveConversation(oldest.id!);
  }
  
  await db.conversations.update(id, {
    state: 'active',
    archivedAt: undefined,
    lastAccessedAt: Date.now(),
    updatedAt: Date.now(),
  });
}

/**
 * Soft delete a conversation
 */
export async function deleteConversation(id: string): Promise<void> {
  await db.conversations.update(id, {
    state: 'deleted',
    updatedAt: Date.now(),
  });
}

/**
 * Permanently delete a conversation and its messages
 */
export async function permanentlyDeleteConversation(id: string): Promise<void> {
  await db.transaction('rw', [db.conversations, db.messages, db.usage], async () => {
    await db.messages.where('conversationId').equals(id).delete();
    await db.usage.where('conversationId').equals(id).delete();
    await db.conversations.delete(id);
  });
}

// ============================================
// MESSAGE OPERATIONS
// ============================================

/**
 * Get messages for a conversation
 */
export async function getMessages(conversationId: string): Promise<ConversationMessage[]> {
  return db.messages
    .where('conversationId')
    .equals(conversationId)
    .sortBy('timestamp');
}

/**
 * Add a user message
 */
export async function addUserMessage(
  conversationId: string,
  content: string,
  images?: { data: string; mimeType: 'image/png' | 'image/jpeg'; name?: string }[]
): Promise<ConversationMessage> {
  const message: ConversationMessage = {
    conversationId,
    role: 'user',
    content,
    timestamp: Date.now(),
    images,
  };
  
  const id = await db.messages.add(message);
  message.id = id;
  
  // Update conversation
  const convo = await getConversation(conversationId);
  if (convo) {
    await updateConversation(conversationId, {
      messageCount: convo.messageCount + 1,
    });
  }
  
  return message;
}

/**
 * Add an assistant message with usage tracking
 */
export async function addAssistantMessage(
  conversationId: string,
  content: string,
  options: {
    actions?: any[];
    status: 'success' | 'error';
    provider: AIProvider;
    model: string;
    inputTokens: number;
    outputTokens: number;
    imageCount?: number;
  }
): Promise<{ message: ConversationMessage; usage: UsageRecord }> {
  const now = Date.now();
  const totalTokens = options.inputTokens + options.outputTokens;
  const cost = calculateCost(options.provider, options.model, options.inputTokens, options.outputTokens);
  
  // Create message
  const message: ConversationMessage = {
    conversationId,
    role: 'assistant',
    content,
    timestamp: now,
    actions: options.actions,
    status: options.status,
    usage: {
      inputTokens: options.inputTokens,
      outputTokens: options.outputTokens,
      totalTokens,
      estimatedCost: cost,
    },
  };
  
  const messageId = await db.messages.add(message);
  message.id = messageId;
  
  // Create usage record
  const usageRecord: UsageRecord = {
    timestamp: now,
    provider: options.provider,
    model: options.model,
    conversationId,
    messageId,
    inputTokens: options.inputTokens,
    outputTokens: options.outputTokens,
    totalTokens,
    estimatedCost: cost,
    imageCount: options.imageCount || 0,
    success: options.status === 'success',
  };
  
  await db.usage.add(usageRecord);
  
  // Update conversation stats
  const convo = await getConversation(conversationId);
  if (convo) {
    await updateConversation(conversationId, {
      messageCount: convo.messageCount + 1,
      totalTokens: convo.totalTokens + totalTokens,
      totalCost: convo.totalCost + cost,
      primaryProvider: options.provider,
      primaryModel: options.model,
    });
  }
  
  return { message, usage: usageRecord };
}

// ============================================
// AUTO TITLE GENERATION
// ============================================

/**
 * Generate a title from the first user message
 */
export function generateTitleFromMessage(content: string): string {
  // Take first 50 chars, cut at word boundary
  const truncated = content.slice(0, 50);
  const lastSpace = truncated.lastIndexOf(' ');
  const title = lastSpace > 20 ? truncated.slice(0, lastSpace) : truncated;
  return title + (content.length > 50 ? '...' : '');
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

export interface ExportedConversation {
  exportedAt: string;
  exportType: 'conversation';
  version: '1.0';
  data: {
    conversation: Conversation;
    messages: ConversationMessage[];
  };
}

/**
 * Export conversation as JSON
 */
export async function exportConversationJSON(id: string): Promise<string> {
  const conversation = await getConversation(id);
  const messages = await getMessages(id);
  
  if (!conversation) throw new Error('Conversation not found');
  
  const exported: ExportedConversation = {
    exportedAt: new Date().toISOString(),
    exportType: 'conversation',
    version: '1.0',
    data: {
      conversation,
      messages,
    },
  };
  
  return JSON.stringify(exported, null, 2);
}

/**
 * Export conversation as Markdown
 */
export async function exportConversationMarkdown(id: string): Promise<string> {
  const conversation = await getConversation(id);
  const messages = await getMessages(id);
  
  if (!conversation) throw new Error('Conversation not found');
  
  const lines: string[] = [
    `# ${conversation.title}`,
    '',
    `**Exported:** ${new Date().toLocaleString()}`,
    `**Duration:** ${formatDuration(conversation.createdAt, conversation.updatedAt)}`,
    `**Total Cost:** $${conversation.totalCost.toFixed(2)} (${conversation.messageCount} messages, ${conversation.totalTokens.toLocaleString()} tokens)`,
    '',
    '---',
    '',
    '## Conversation',
    '',
  ];
  
  for (const msg of messages) {
    const time = new Date(msg.timestamp).toLocaleTimeString();
    const sender = msg.role === 'user' ? 'You' : 'AI Assistant';
    
    lines.push(`### ${time} • ${sender}${msg.usage ? ` • $${msg.usage.estimatedCost.toFixed(4)}` : ''}`);
    lines.push('');
    lines.push(msg.content);
    lines.push('');
    
    if (msg.actions && msg.actions.length > 0) {
      lines.push('**Actions Applied:**');
      for (const action of msg.actions) {
        lines.push(`- ${action.type}: ${action.componentType || action.componentId}`);
      }
      lines.push('');
    }
    
    if (msg.usage) {
      lines.push(`*Tokens: ${msg.usage.inputTokens} input, ${msg.usage.outputTokens} output*`);
      lines.push('');
    }
    
    lines.push('---');
    lines.push('');
  }
  
  return lines.join('\n');
}

function formatDuration(start: number, end: number): string {
  const diff = end - start;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
}

// ============================================
// CLEANUP
// ============================================

/**
 * Clean up old deleted conversations (older than 30 days)
 */
export async function cleanupDeletedConversations(): Promise<number> {
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  
  const deleted = await db.conversations
    .where('state')
    .equals('deleted')
    .filter(c => c.updatedAt < thirtyDaysAgo)
    .toArray();
  
  for (const convo of deleted) {
    await permanentlyDeleteConversation(convo.id!);
  }
  
  return deleted.length;
}
