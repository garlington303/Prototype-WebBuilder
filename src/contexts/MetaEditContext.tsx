/**
 * MetaEditContext
 * React context for meta-edit mode functionality
 * Provides context-aware editing capabilities for the workspace UI itself
 */

import React, { createContext, useContext, useCallback, useEffect } from 'react';
import { useWorkspaceStore, setupWorkspaceKeyboardShortcuts } from '@/store/workspace-store';
import { MetaElementType } from '@/types/workspace';

// ============================================
// CONTEXT VALUE INTERFACE
// ============================================

export interface MetaEditContextValue {
  // State
  isMetaEditMode: boolean;
  selectedElementId: string | null;
  selectedElementType: MetaElementType | null;
  hoveredElementId: string | null;
  
  // Actions
  toggleMetaEditMode: () => void;
  selectElement: (id: string | null, type: MetaElementType | null) => void;
  hoverElement: (id: string | null) => void;
  clearSelection: () => void;
  
  // Helpers
  isSelected: (id: string) => boolean;
  isHovered: (id: string) => boolean;
  canEdit: (id: string) => boolean;
}

// ============================================
// CONTEXT CREATION
// ============================================

const MetaEditContext = createContext<MetaEditContextValue | null>(null);

// ============================================
// PROVIDER COMPONENT
// ============================================

interface MetaEditProviderProps {
  children: React.ReactNode;
}

export const MetaEditProvider: React.FC<MetaEditProviderProps> = ({ children }) => {
  // Get state from workspace store
  const metaEdit = useWorkspaceStore((s) => s.metaEdit);
  const toggleMetaEditMode = useWorkspaceStore((s) => s.toggleMetaEditMode);
  const selectMetaElement = useWorkspaceStore((s) => s.selectMetaElement);
  const hoverMetaElement = useWorkspaceStore((s) => s.hoverMetaElement);
  const clearMetaSelection = useWorkspaceStore((s) => s.clearMetaSelection);
  
  // Initialize keyboard shortcuts
  useEffect(() => {
    const cleanup = setupWorkspaceKeyboardShortcuts();
    return cleanup;
  }, []);
  
  // Wrapped actions with better ergonomics
  const selectElement = useCallback((id: string | null, type: MetaElementType | null) => {
    selectMetaElement(id, type);
  }, [selectMetaElement]);
  
  const hoverElement = useCallback((id: string | null) => {
    if (metaEdit.isActive) {
      hoverMetaElement(id);
    }
  }, [metaEdit.isActive, hoverMetaElement]);
  
  const clearSelection = useCallback(() => {
    clearMetaSelection();
  }, [clearMetaSelection]);
  
  // Helper functions
  const isSelected = useCallback((id: string): boolean => {
    return metaEdit.isActive && metaEdit.selectedElementId === id;
  }, [metaEdit.isActive, metaEdit.selectedElementId]);
  
  const isHovered = useCallback((id: string): boolean => {
    return metaEdit.isActive && metaEdit.hoveredElementId === id;
  }, [metaEdit.isActive, metaEdit.hoveredElementId]);
  
  const canEdit = useCallback((id: string): boolean => {
    return metaEdit.isActive;
  }, [metaEdit.isActive]);
  
  // Context value
  const value: MetaEditContextValue = {
    isMetaEditMode: metaEdit.isActive,
    selectedElementId: metaEdit.selectedElementId,
    selectedElementType: metaEdit.selectedElementType,
    hoveredElementId: metaEdit.hoveredElementId,
    toggleMetaEditMode,
    selectElement,
    hoverElement,
    clearSelection,
    isSelected,
    isHovered,
    canEdit,
  };
  
  return (
    <MetaEditContext.Provider value={value}>
      {children}
      {/* Meta Edit Mode Indicator */}
      {metaEdit.isActive && <MetaEditIndicator />}
    </MetaEditContext.Provider>
  );
};

// ============================================
// META EDIT MODE INDICATOR
// ============================================

const MetaEditIndicator: React.FC = () => {
  const { toggleMetaEditMode } = useMetaEdit();
  
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3 px-4 py-2 bg-purple-600/95 text-white rounded-full shadow-lg shadow-purple-500/25 backdrop-blur-sm border border-purple-400/30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-sm font-medium">Meta Edit Mode</span>
        </div>
        <div className="h-4 w-px bg-white/30" />
        <span className="text-xs text-purple-200">Click any panel or section to edit</span>
        <div className="h-4 w-px bg-white/30" />
        <button
          onClick={toggleMetaEditMode}
          className="text-xs px-2 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors"
        >
          Exit <span className="opacity-70">(Esc)</span>
        </button>
      </div>
    </div>
  );
};

// ============================================
// CUSTOM HOOK
// ============================================

export const useMetaEdit = (): MetaEditContextValue => {
  const context = useContext(MetaEditContext);
  
  if (!context) {
    throw new Error('useMetaEdit must be used within a MetaEditProvider');
  }
  
  return context;
};

// ============================================
// HOC FOR META-EDITABLE COMPONENTS
// ============================================

export interface WithMetaEditProps {
  elementId: string;
  elementType: MetaElementType;
}

export function withMetaEdit<P extends object>(
  WrappedComponent: React.ComponentType<P & { metaEdit: MetaEditContextValue }>
): React.FC<P & WithMetaEditProps> {
  return function MetaEditableComponent(props: P & WithMetaEditProps) {
    const metaEdit = useMetaEdit();
    return <WrappedComponent {...props} metaEdit={metaEdit} />;
  };
}

// ============================================
// UTILITY COMPONENTS
// ============================================

/**
 * MetaEditWrapper - Wraps a component to make it meta-editable
 * Adds hover/selection effects and click handling
 */
interface MetaEditWrapperProps {
  elementId: string;
  elementType: MetaElementType;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const MetaEditWrapper: React.FC<MetaEditWrapperProps> = ({
  elementId,
  elementType,
  children,
  className = '',
  disabled = false,
}) => {
  const { 
    isMetaEditMode, 
    selectElement, 
    hoverElement, 
    isSelected, 
    isHovered 
  } = useMetaEdit();
  
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isMetaEditMode && !disabled) {
      e.stopPropagation();
      selectElement(elementId, elementType);
    }
  }, [isMetaEditMode, disabled, selectElement, elementId, elementType]);
  
  const handleMouseEnter = useCallback(() => {
    if (isMetaEditMode && !disabled) {
      hoverElement(elementId);
    }
  }, [isMetaEditMode, disabled, hoverElement, elementId]);
  
  const handleMouseLeave = useCallback(() => {
    if (isMetaEditMode && !disabled) {
      hoverElement(null);
    }
  }, [isMetaEditMode, disabled, hoverElement]);
  
  const selected = isSelected(elementId);
  const hovered = isHovered(elementId);
  
  // Dynamic classes for meta-edit mode
  const metaEditClasses = isMetaEditMode && !disabled ? [
    'transition-all duration-150',
    hovered && !selected ? 'ring-2 ring-purple-400/50 ring-offset-1 ring-offset-background' : '',
    selected ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-background shadow-lg shadow-purple-500/20' : '',
    'cursor-pointer',
  ].filter(Boolean).join(' ') : '';
  
  return (
    <div
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`${className} ${metaEditClasses}`.trim()}
      data-meta-edit-id={elementId}
      data-meta-edit-type={elementType}
    >
      {children}
      
      {/* Selection Label */}
      {isMetaEditMode && selected && (
        <div className="absolute -top-6 left-2 z-50 px-2 py-0.5 bg-purple-500 text-white text-[10px] font-medium rounded uppercase tracking-wide shadow-md">
          {elementType}
        </div>
      )}
    </div>
  );
};

/**
 * MetaEditHandle - Drag handle for reordering in meta-edit mode
 */
interface MetaEditHandleProps {
  className?: string;
}

export const MetaEditHandle: React.FC<MetaEditHandleProps> = ({ className = '' }) => {
  const { isMetaEditMode } = useMetaEdit();
  
  if (!isMetaEditMode) return null;
  
  return (
    <div className={`cursor-grab active:cursor-grabbing ${className}`}>
      <svg 
        width="12" 
        height="12" 
        viewBox="0 0 12 12" 
        fill="currentColor" 
        className="text-muted-foreground/50 hover:text-muted-foreground"
      >
        <circle cx="3" cy="3" r="1.5" />
        <circle cx="9" cy="3" r="1.5" />
        <circle cx="3" cy="9" r="1.5" />
        <circle cx="9" cy="9" r="1.5" />
      </svg>
    </div>
  );
};
