/**
 * DynamicLayout
 * Main layout wrapper that uses dynamic panels
 * Replaces static layout with fully customizable workspace
 */

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useWorkspaceStore } from '@/store/workspace-store';
import { MetaEditProvider } from '@/contexts/MetaEditContext';
import { DynamicPanel } from './DynamicPanel';

// ============================================
// PROPS INTERFACE
// ============================================

interface DynamicLayoutProps {
  children: React.ReactNode;
  className?: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export const DynamicLayout: React.FC<DynamicLayoutProps> = ({
  children,
  className = '',
}) => {
  const workspace = useWorkspaceStore((s) => s.workspace);
  const initialize = useWorkspaceStore((s) => s.initialize);
  const saveWorkspace = useWorkspaceStore((s) => s.saveWorkspace);
  const isInitialized = useWorkspaceStore((s) => s.isInitialized);
  const isLoading = useWorkspaceStore((s) => s.isLoading);
  
  const { layout } = workspace;
  const { leftSidebar, rightSidebar, header, footer } = layout.panels;
  
  // Initialize workspace on mount
  useEffect(() => {
    initialize();
  }, [initialize]);
  
  // Auto-save workspace changes (debounced)
  useEffect(() => {
    if (!isInitialized) return;
    
    const timeoutId = setTimeout(() => {
      saveWorkspace();
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [workspace, isInitialized, saveWorkspace]);
  
  // Show loading state
  if (isLoading && !isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <MetaEditProvider>
      <div className={cn('flex flex-col h-screen bg-background overflow-hidden', className)}>
        {/* Header Panel */}
        {header.visible && (
          <DynamicPanel panelId={header.id} />
        )}
        
        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          {leftSidebar.visible && (
            <DynamicPanel panelId={leftSidebar.id} />
          )}
          
          {/* Canvas/Main Content */}
          <main className="flex-1 overflow-auto relative bg-background">
            {children}
          </main>
          
          {/* Right Sidebar */}
          {rightSidebar.visible && (
            <DynamicPanel panelId={rightSidebar.id} />
          )}
        </div>
        
        {/* Footer Panel */}
        {footer.visible && (
          <DynamicPanel panelId={footer.id} />
        )}
      </div>
    </MetaEditProvider>
  );
};

export default DynamicLayout;
