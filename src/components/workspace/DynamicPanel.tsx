/**
 * DynamicPanel
 * Resizable, collapsible panel component for the workspace layout
 * Supports meta-edit mode for visual customization
 */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useWorkspaceStore } from '@/store/workspace-store';
import { useMetaEdit, MetaEditWrapper } from '@/contexts/MetaEditContext';
import { PanelConfig, Section } from '@/types/workspace';
import { DynamicSection } from './DynamicSection';
import { PanelResizeHandle } from './PanelResizeHandle';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, MoreVertical, GripVertical } from 'lucide-react';

// ============================================
// PROPS INTERFACE
// ============================================

interface DynamicPanelProps {
  panelId: string;
  className?: string;
  children?: React.ReactNode;
}

// ============================================
// MAIN COMPONENT
// ============================================

export const DynamicPanel: React.FC<DynamicPanelProps> = ({
  panelId,
  className = '',
  children,
}) => {
  const panel = useWorkspaceStore((s) => s.getPanelById(panelId));
  const togglePanelCollapse = useWorkspaceStore((s) => s.togglePanelCollapse);
  const resizePanel = useWorkspaceStore((s) => s.resizePanel);
  const reorderSections = useWorkspaceStore((s) => s.reorderSections);
  const { isMetaEditMode } = useMetaEdit();
  
  // State for drag reordering
  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  if (!panel || !panel.visible) return null;
  
  const isHorizontal = panel.position === 'left' || panel.position === 'right';
  const isVertical = panel.position === 'top' || panel.position === 'bottom';
  const showResizeHandle = panel.resizable && !panel.collapsed;
  
  // Determine resize handle position
  const resizePosition = panel.position === 'left' ? 'right' :
                         panel.position === 'right' ? 'left' :
                         panel.position === 'top' ? 'bottom' : 'top';
  
  // Handle section reordering via drag and drop
  const handleSectionDragStart = (index: number) => {
    if (!isMetaEditMode) return;
    setDraggedSectionIndex(index);
  };
  
  const handleSectionDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedSectionIndex === null || !isMetaEditMode) return;
    setDragOverIndex(index);
  };
  
  const handleSectionDrop = (index: number) => {
    if (draggedSectionIndex === null || !isMetaEditMode) return;
    if (draggedSectionIndex !== index) {
      reorderSections(panelId, draggedSectionIndex, index);
    }
    setDraggedSectionIndex(null);
    setDragOverIndex(null);
  };
  
  const handleSectionDragEnd = () => {
    setDraggedSectionIndex(null);
    setDragOverIndex(null);
  };
  
  // Collapse button icon
  const CollapseIcon = panel.collapsed
    ? (panel.position === 'left' ? ChevronRight : 
       panel.position === 'right' ? ChevronLeft :
       panel.position === 'top' ? ChevronDown : ChevronUp)
    : (panel.position === 'left' ? ChevronLeft : 
       panel.position === 'right' ? ChevronRight :
       panel.position === 'top' ? ChevronUp : ChevronDown);

  // Calculate size styles
  const sizeStyle: React.CSSProperties = {};
  if (isHorizontal) {
    sizeStyle.width = panel.collapsed ? 48 : panel.width;
    sizeStyle.minWidth = panel.collapsed ? 48 : panel.minWidth;
    sizeStyle.maxWidth = panel.collapsed ? 48 : panel.maxWidth;
  } else {
    sizeStyle.height = panel.collapsed ? 40 : panel.height;
    sizeStyle.minHeight = panel.collapsed ? 40 : panel.minHeight;
    sizeStyle.maxHeight = panel.collapsed ? 40 : panel.maxHeight;
  }

  return (
    <MetaEditWrapper
      elementId={panelId}
      elementType="panel"
      className={cn(
        'relative flex transition-all duration-200 ease-out',
        isHorizontal ? 'flex-col h-full' : 'flex-row w-full',
        panel.collapsed && 'overflow-hidden',
        className
      )}
    >
      <div
        className={cn(
          'relative flex bg-background/95 backdrop-blur-sm border-border',
          isHorizontal ? 'flex-col h-full' : 'flex-row w-full',
          panel.position === 'left' && 'border-r',
          panel.position === 'right' && 'border-l',
          panel.position === 'top' && 'border-b',
          panel.position === 'bottom' && 'border-t',
        )}
        style={sizeStyle}
      >
        {/* Collapsed State */}
        {panel.collapsed && panel.collapsible && (
          <div className={cn(
            'flex items-center justify-center h-full w-full',
            isHorizontal ? 'flex-col gap-2 py-4' : 'flex-row gap-2 px-4'
          )}>
            <button
              onClick={() => togglePanelCollapse(panelId)}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              title="Expand panel"
            >
              <CollapseIcon className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        )}
        
        {/* Expanded Content */}
        {!panel.collapsed && (
          <>
            {/* Panel Header with Collapse Button */}
            {panel.collapsible && (
              <div className={cn(
                'flex items-center justify-between px-2 py-1.5 border-b border-border/50',
                'bg-muted/30'
              )}>
                {/* Drag handle in meta-edit mode */}
                {isMetaEditMode && (
                  <div className="cursor-grab active:cursor-grabbing p-1">
                    <GripVertical className="w-3 h-3 text-muted-foreground/50" />
                  </div>
                )}
                
                <div className="flex-1" />
                
                <button
                  onClick={() => togglePanelCollapse(panelId)}
                  className="p-1 hover:bg-accent rounded transition-colors"
                  title="Collapse panel"
                >
                  <CollapseIcon className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            )}
            
            {/* Sections */}
            <div className={cn(
              'flex-1 overflow-y-auto overflow-x-hidden',
              isHorizontal ? 'flex flex-col' : 'flex flex-row'
            )}>
              {panel.sections
                .filter(s => s.visible)
                .sort((a, b) => a.order - b.order)
                .map((section, index) => (
                  <div
                    key={section.id}
                    draggable={isMetaEditMode}
                    onDragStart={() => handleSectionDragStart(index)}
                    onDragOver={(e) => handleSectionDragOver(e, index)}
                    onDrop={() => handleSectionDrop(index)}
                    onDragEnd={handleSectionDragEnd}
                    className={cn(
                      'transition-all duration-150',
                      draggedSectionIndex === index && 'opacity-50',
                      dragOverIndex === index && draggedSectionIndex !== index && 
                        'border-t-2 border-purple-500'
                    )}
                  >
                    <DynamicSection
                      section={section}
                      panelId={panelId}
                    />
                  </div>
                ))
              }
              
              {/* Custom children (for backward compatibility) */}
              {children}
            </div>
          </>
        )}
        
        {/* Resize Handle */}
        {showResizeHandle && (
          <PanelResizeHandle
            panelId={panelId}
            position={resizePosition}
            onResize={(delta) => {
              const currentSize = isHorizontal ? panel.width! : panel.height!;
              const newSize = panel.position === 'right' || panel.position === 'bottom'
                ? currentSize - delta
                : currentSize + delta;
              resizePanel(panelId, newSize);
            }}
          />
        )}
      </div>
    </MetaEditWrapper>
  );
};

export default DynamicPanel;
