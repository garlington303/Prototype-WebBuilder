import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useBuilderStore, Component } from '@/store/builder-store';
import { ComponentRegistry } from './component-registry';
import { cn } from '@/lib/utils';

// Check if a component type supports inline text editing
const isTextEditable = (type: string): boolean => {
  return ['text', 'header', 'button'].includes(type);
};

// Get the text content prop key for different component types
const getTextPropKey = (type: string): string => {
  return 'children'; // All text-editable components use 'children' for text
};

interface InlineEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  onCancel: () => void;
  componentType: string;
  fontSize?: number;
}

const InlineEditor: React.FC<InlineEditorProps> = ({ 
  value, 
  onChange, 
  onBlur, 
  onCancel,
  componentType,
  fontSize = 16
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onChange(localValue);
      onBlur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleBlur = () => {
    onChange(localValue);
    onBlur();
  };

  return (
    <textarea
      ref={inputRef}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className={cn(
        "absolute inset-0 w-full h-full p-2 bg-background border-2 border-primary rounded-sm resize-none z-50 focus:outline-none focus:ring-2 focus:ring-primary/50",
        componentType === 'header' && "font-bold",
        componentType === 'button' && "font-medium text-center"
      )}
      style={{ 
        minHeight: '100%',
        boxSizing: 'border-box',
        fontSize: `${fontSize}px`,
      }}
    />
  );
};

interface CanvasNodeProps {
  node: Component;
  mode: 'edit' | 'preview';
  selectedId: string | null;
  editingId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onDragStart: (e: React.MouseEvent, id: string) => void;
  onResizeStart: (e: React.MouseEvent, id: string, handle: string) => void;
  onStartEditing: (id: string) => void;
  onStopEditing: () => void;
  onUpdateText: (id: string, text: string) => void;
  setHoveredId: (id: string | null) => void;
}

const CanvasNode: React.FC<CanvasNodeProps> = ({ 
  node, 
  mode, 
  selectedId,
  editingId,
  hoveredId,
  onSelect,
  onDragStart,
  onResizeStart,
  onStartEditing,
  onStopEditing,
  onUpdateText,
  setHoveredId,
}) => {
  const isSelected = selectedId === node.id;
  const isEditing = editingId === node.id;
  const canEditText = isTextEditable(node.type);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode === 'edit' && !isEditing) {
      e.stopPropagation();
      e.preventDefault(); // Prevent native drag/selection
      onSelect(node.id);
      onDragStart(e, node.id);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (mode === 'edit' && canEditText) {
      e.stopPropagation();
      e.preventDefault();
      onStartEditing(node.id);
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    onResizeStart(e, node.id, handle);
  };

  const handleTextChange = (newText: string) => {
    onUpdateText(node.id, newText);
  };

  const handleMouseOver = (e: React.MouseEvent) => {
    if (mode === 'edit') {
      e.stopPropagation();
      setHoveredId(node.id);
    }
  };

  const content = (
    <ComponentRegistry type={node.type} props={node.props}>
      {node.children.map((child) => (
        <CanvasNode
          key={child.id}
          node={child}
          mode={mode}
          selectedId={selectedId}
          editingId={editingId}
          hoveredId={hoveredId}
          onSelect={onSelect}
          onDragStart={onDragStart}
          onResizeStart={onResizeStart}
          onStartEditing={onStartEditing}
          onStopEditing={onStopEditing}
          onUpdateText={onUpdateText}
          setHoveredId={setHoveredId}
        />
      ))}
    </ComponentRegistry>
  );

  if (mode === 'preview') {
    return (
      <div
        style={{
          position: 'absolute',
          left: node.position.x,
          top: node.position.y,
          width: node.position.width,
          height: node.position.height,
        }}
      >
        {content}
      </div>
    );
  }

  // Edit Mode - absolute positioned with selection/resize handles
  return (
    <div
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onMouseOver={handleMouseOver}
      style={{
        position: 'absolute',
        left: node.position.x,
        top: node.position.y,
        width: node.position.width,
        height: node.position.height,
        cursor: isEditing ? 'text' : 'move',
      }}
      className={cn(
        "group transition-shadow duration-150",
        isSelected && "ring-2 ring-primary ring-offset-1 z-20",
        !isSelected && hoveredId === node.id && "ring-1 ring-primary/50",
        isEditing && "ring-2 ring-blue-500 z-30"
      )}
    >
      {/* Component Label */}
      {isSelected && !isEditing && (
        <div className="absolute -top-6 left-0 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-t-md font-medium z-30 uppercase tracking-wider cursor-move">
          {node.type} {canEditText && <span className="opacity-70">• dbl-click to edit</span>}
        </div>
      )}

      {/* Editing indicator */}
      {isEditing && (
        <div className="absolute -top-6 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-t-md font-medium z-30 pointer-events-none">
          Editing • Enter to save, Esc to cancel
        </div>
      )}
      
      {/* Content or Inline Editor */}
      <div className="w-full h-full overflow-hidden rounded-sm relative">
        {isEditing ? (
          <InlineEditor
            value={node.props.children || ''}
            onChange={handleTextChange}
            onBlur={onStopEditing}
            onCancel={onStopEditing}
            componentType={node.type}
            fontSize={node.props.fontSize}
          />
        ) : (
          content
        )}
      </div>

      {/* Resize Handles - only show when selected and not editing */}
      {isSelected && !isEditing && (
        <>
          {/* Corner handles */}
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
            className="absolute -top-1 -left-1 w-3 h-3 bg-primary border-2 border-background rounded-sm cursor-nw-resize z-30"
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
            className="absolute -top-1 -right-1 w-3 h-3 bg-primary border-2 border-background rounded-sm cursor-ne-resize z-30"
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
            className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary border-2 border-background rounded-sm cursor-sw-resize z-30"
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary border-2 border-background rounded-sm cursor-se-resize z-30"
          />
          {/* Edge handles */}
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-primary/80 rounded-sm cursor-n-resize z-30"
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 's')}
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-primary/80 rounded-sm cursor-s-resize z-30"
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
            className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-6 bg-primary/80 rounded-sm cursor-w-resize z-30"
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
            className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-6 bg-primary/80 rounded-sm cursor-e-resize z-30"
          />
        </>
      )}
    </div>
  );
};

export function CanvasRenderer() {
  const components = useBuilderStore((s) => s.components);
  const mode = useBuilderStore((s) => s.mode);
  const selectedId = useBuilderStore((s) => s.selectedId);
  const selectComponent = useBuilderStore((s) => s.selectComponent);
  const updateComponentPosition = useBuilderStore((s) => s.updateComponentPosition);
  const updateComponent = useBuilderStore((s) => s.updateComponent);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Handlers for inline text editing
  const handleStartEditing = useCallback((id: string) => {
    setEditingId(id);
  }, []);

  const handleStopEditing = useCallback(() => {
    setEditingId(null);
  }, []);

  const handleUpdateText = useCallback((id: string, text: string) => {
    updateComponent(id, { children: text });
    setEditingId(null);
  }, [updateComponent]);

  const dragState = useRef<{
    isDragging: boolean;
    isResizing: boolean;
    nodeId: string | null;
    startX: number;
    startY: number;
    startNodeX: number;
    startNodeY: number;
    startWidth: number;
    startHeight: number;
    startFontSize: number;
    resizeHandle: string | null;
  }>({
    isDragging: false,
    isResizing: false,
    nodeId: null,
    startX: 0,
    startY: 0,
    startNodeX: 0,
    startNodeY: 0,
    startWidth: 0,
    startHeight: 0,
    startFontSize: 16,
    resizeHandle: null,
  });

  // Helper to find node recursively
  const findNodeById = useCallback((nodes: Component[], id: string): Component | undefined => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children.length > 0) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return undefined;
  }, []);

  const handleDragStart = useCallback((e: React.MouseEvent, id: string) => {
    const node = findNodeById(components, id);
    if (!node) return;

    dragState.current = {
      isDragging: true,
      isResizing: false,
      nodeId: id,
      startX: e.clientX,
      startY: e.clientY,
      startNodeX: node.position.x,
      startNodeY: node.position.y,
      startWidth: node.position.width,
      startHeight: node.position.height,
      startFontSize: node.props.fontSize || 16,
      resizeHandle: null,
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [components, findNodeById]);

  const handleResizeStart = useCallback((e: React.MouseEvent, id: string, handle: string) => {
    const node = findNodeById(components, id);
    if (!node) return;

    dragState.current = {
      isDragging: false,
      isResizing: true,
      nodeId: id,
      startX: e.clientX,
      startY: e.clientY,
      startNodeX: node.position.x,
      startNodeY: node.position.y,
      startWidth: node.position.width,
      startHeight: node.position.height,
      startFontSize: node.props.fontSize || 16,
      resizeHandle: handle,
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [components, findNodeById]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const state = dragState.current;
    if (!state.nodeId) return;

    const deltaX = e.clientX - state.startX;
    const deltaY = e.clientY - state.startY;

    if (state.isDragging) {
      updateComponentPosition(state.nodeId, {
        x: Math.max(0, state.startNodeX + deltaX),
        y: Math.max(0, state.startNodeY + deltaY),
      });
    } else if (state.isResizing && state.resizeHandle) {
      const handle = state.resizeHandle;
      let newX = state.startNodeX;
      let newY = state.startNodeY;
      let newWidth = state.startWidth;
      let newHeight = state.startHeight;

      // Handle horizontal resizing
      if (handle.includes('w')) {
        newX = state.startNodeX + deltaX;
        newWidth = state.startWidth - deltaX;
      }
      if (handle.includes('e')) {
        newWidth = state.startWidth + deltaX;
      }

      // Handle vertical resizing
      if (handle.includes('n')) {
        newY = state.startNodeY + deltaY;
        newHeight = state.startHeight - deltaY;
      }
      if (handle.includes('s')) {
        newHeight = state.startHeight + deltaY;
      }

      // Enforce minimum size
      const minWidth = 50;
      const minHeight = 30;

      if (newWidth >= minWidth && newHeight >= minHeight) {
        updateComponentPosition(state.nodeId, {
          x: Math.max(0, newX),
          y: Math.max(0, newY),
          width: newWidth,
          height: newHeight,
        });
        
        // Scale font size proportionally based on size change
        // Use the average of width and height scale factors for balanced scaling
        const widthScale = newWidth / state.startWidth;
        const heightScale = newHeight / state.startHeight;
        const avgScale = (widthScale + heightScale) / 2;
        const newFontSize = Math.max(8, Math.min(200, Math.round(state.startFontSize * avgScale)));
        
        // Only update if there's a meaningful change to avoid constant updates
        if (state.startFontSize) {
          updateComponent(state.nodeId, { fontSize: newFontSize });
        }
      }
    }
  }, [updateComponentPosition, updateComponent]);

  const handleMouseUp = useCallback(() => {
    dragState.current = {
      isDragging: false,
      isResizing: false,
      nodeId: null,
      startX: 0,
      startY: 0,
      startNodeX: 0,
      startNodeY: 0,
      startWidth: 0,
      startHeight: 0,
      startFontSize: 16,
      resizeHandle: null,
    };
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on canvas background
    if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.canvasBackground) {
      selectComponent(null);
    }
  };

  return (
    <div
      ref={canvasRef}
      onClick={handleCanvasClick}
      onMouseLeave={() => setHoveredId(null)}
      data-canvas-background="true"
      className={cn(
        "min-h-full w-full relative overflow-auto",
        mode === 'edit' && "bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:20px_20px]"
      )}
      style={{ minHeight: '100vh' }}
    >
      {/* Inner canvas area */}
      <div 
        data-canvas-background="true"
        className="relative"
        style={{ minWidth: '2000px', minHeight: '2000px' }}
      >
        {components.length === 0 && mode === 'edit' ? (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-muted-foreground space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
              <span className="text-2xl">✨</span>
            </div>
            <div className="text-center">
              <h3 className="font-medium text-foreground">Canvas is Empty</h3>
              <p className="text-sm">Drag components from the sidebar to start building.</p>
            </div>
          </div>
        ) : (
          components.map((node) => (
            <CanvasNode
              key={node.id}
              node={node}
              mode={mode}
              selectedId={selectedId}
              editingId={editingId}
              hoveredId={hoveredId}
              onSelect={selectComponent}
              onDragStart={handleDragStart}
              onResizeStart={handleResizeStart}
              onStartEditing={handleStartEditing}
              onStopEditing={handleStopEditing}
              onUpdateText={handleUpdateText}
              setHoveredId={setHoveredId}
            />
          ))
        )}
      </div>
    </div>
  );
}