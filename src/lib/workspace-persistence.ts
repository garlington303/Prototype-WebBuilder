/**
 * Workspace Persistence Layer
 * Modular persistence system with adapter pattern for future backend integration
 */

import { PersistenceAdapter, WorkspaceConfig, WorkspaceExport } from '@/types/workspace';

// ============================================
// LOCAL STORAGE ADAPTER
// ============================================

export class LocalStorageAdapter implements PersistenceAdapter {
  private prefix: string;

  constructor(prefix: string = 'aetheria_') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async save(key: string, data: unknown): Promise<void> {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(this.getKey(key), serialized);
    } catch (error) {
      console.error('LocalStorageAdapter: Failed to save', key, error);
      throw new Error(`Failed to save ${key}: ${error}`);
    }
  }

  async load<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(this.getKey(key));
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('LocalStorageAdapter: Failed to load', key, error);
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error('LocalStorageAdapter: Failed to delete', key, error);
    }
  }

  async list(prefix?: string): Promise<string[]> {
    const fullPrefix = prefix ? this.getKey(prefix) : this.prefix;
    const keys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(fullPrefix)) {
        // Remove the adapter prefix to return clean keys
        keys.push(key.substring(this.prefix.length));
      }
    }
    
    return keys;
  }

  async clear(prefix?: string): Promise<void> {
    const keys = await this.list(prefix);
    for (const key of keys) {
      await this.delete(key);
    }
  }
}

// ============================================
// FUTURE: SUPABASE ADAPTER (Skeleton)
// ============================================

// export class SupabaseAdapter implements PersistenceAdapter {
//   private client: SupabaseClient;
//   private tableName: string;
//
//   constructor(client: SupabaseClient, tableName: string = 'workspaces') {
//     this.client = client;
//     this.tableName = tableName;
//   }
//
//   async save(key: string, data: unknown): Promise<void> {
//     const { error } = await this.client
//       .from(this.tableName)
//       .upsert({ key, data, updated_at: new Date().toISOString() });
//     if (error) throw error;
//   }
//
//   async load<T>(key: string): Promise<T | null> {
//     const { data, error } = await this.client
//       .from(this.tableName)
//       .select('data')
//       .eq('key', key)
//       .single();
//     if (error) return null;
//     return data?.data as T;
//   }
//
//   async delete(key: string): Promise<void> {
//     await this.client.from(this.tableName).delete().eq('key', key);
//   }
//
//   async list(prefix?: string): Promise<string[]> {
//     const query = this.client.from(this.tableName).select('key');
//     if (prefix) query.like('key', `${prefix}%`);
//     const { data } = await query;
//     return data?.map(d => d.key) || [];
//   }
//
//   async clear(prefix?: string): Promise<void> {
//     const keys = await this.list(prefix);
//     for (const key of keys) {
//       await this.delete(key);
//     }
//   }
// }

// ============================================
// WORKSPACE PERSISTENCE SERVICE
// ============================================

const WORKSPACE_PREFIX = 'workspace_';
const CURRENT_WORKSPACE_KEY = 'current_workspace_id';
const WORKSPACE_VERSION = '1.0.0';

export class WorkspacePersistence {
  private adapter: PersistenceAdapter;

  constructor(adapter?: PersistenceAdapter) {
    this.adapter = adapter || new LocalStorageAdapter();
  }

  /**
   * Switch to a different adapter (for future backend integration)
   */
  setAdapter(adapter: PersistenceAdapter): void {
    this.adapter = adapter;
  }

  /**
   * Save a workspace configuration
   */
  async saveWorkspace(config: WorkspaceConfig): Promise<void> {
    const updatedConfig = {
      ...config,
      updatedAt: Date.now(),
    };
    await this.adapter.save(`${WORKSPACE_PREFIX}${config.id}`, updatedConfig);
  }

  /**
   * Load a workspace by ID
   */
  async loadWorkspace(id: string): Promise<WorkspaceConfig | null> {
    return await this.adapter.load<WorkspaceConfig>(`${WORKSPACE_PREFIX}${id}`);
  }

  /**
   * Delete a workspace
   */
  async deleteWorkspace(id: string): Promise<void> {
    await this.adapter.delete(`${WORKSPACE_PREFIX}${id}`);
  }

  /**
   * List all saved workspaces
   */
  async listWorkspaces(): Promise<WorkspaceConfig[]> {
    const keys = await this.adapter.list(WORKSPACE_PREFIX);
    const workspaces: WorkspaceConfig[] = [];
    
    for (const key of keys) {
      const workspace = await this.adapter.load<WorkspaceConfig>(key);
      if (workspace) {
        workspaces.push(workspace);
      }
    }
    
    // Sort by updatedAt descending
    return workspaces.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  /**
   * Save the ID of the currently active workspace
   */
  async setCurrentWorkspaceId(id: string): Promise<void> {
    await this.adapter.save(CURRENT_WORKSPACE_KEY, id);
  }

  /**
   * Get the ID of the currently active workspace
   */
  async getCurrentWorkspaceId(): Promise<string | null> {
    return await this.adapter.load<string>(CURRENT_WORKSPACE_KEY);
  }

  /**
   * Export a workspace to a portable format
   */
  async exportWorkspace(id: string): Promise<WorkspaceExport | null> {
    const workspace = await this.loadWorkspace(id);
    if (!workspace) return null;

    return {
      version: WORKSPACE_VERSION,
      exportedAt: Date.now(),
      workspace,
    };
  }

  /**
   * Import a workspace from exported data
   */
  async importWorkspace(exportData: WorkspaceExport, newId?: string): Promise<WorkspaceConfig> {
    // Validate export version
    if (!exportData.version || !exportData.workspace) {
      throw new Error('Invalid workspace export format');
    }

    // Create a new workspace with optional new ID
    const importedWorkspace: WorkspaceConfig = {
      ...exportData.workspace,
      id: newId || `imported_${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isDefault: false,
      isPreset: false,
    };

    await this.saveWorkspace(importedWorkspace);
    return importedWorkspace;
  }

  /**
   * Duplicate an existing workspace
   */
  async duplicateWorkspace(id: string, newName?: string): Promise<WorkspaceConfig | null> {
    const original = await this.loadWorkspace(id);
    if (!original) return null;

    const duplicate: WorkspaceConfig = {
      ...original,
      id: `workspace_${Date.now()}`,
      name: newName || `${original.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isDefault: false,
      isPreset: false,
    };

    await this.saveWorkspace(duplicate);
    return duplicate;
  }

  /**
   * Clear all workspaces (use with caution!)
   */
  async clearAllWorkspaces(): Promise<void> {
    await this.adapter.clear(WORKSPACE_PREFIX);
    await this.adapter.delete(CURRENT_WORKSPACE_KEY);
  }

  /**
   * Check if any workspaces exist
   */
  async hasWorkspaces(): Promise<boolean> {
    const keys = await this.adapter.list(WORKSPACE_PREFIX);
    return keys.length > 0;
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const workspacePersistence = new WorkspacePersistence();
