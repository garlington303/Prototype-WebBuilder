import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useBuilderStore, Component } from '@/store/builder-store';
import { ComponentRegistry } from './component-registry';
import { cn } from '@/lib/utils';
interface CanvasNodeProps {
  node: Component;
  mode: 'edit' | 'preview';
  selectedId: string | null;
  onSelect: (id: string) => void;
}
const CanvasNode: React.FC<CanvasNodeProps> = ({ node, mode, selectedId, onSelect }) => {
  const isSelected = selectedId === node.id;
  const isContainer = node.type === 'container' || node.type === 'card';
  // If it's a container, it needs to be droppable
  const { setNodeRef, isOver } = useDroppable({
    id: node.id,
    data: { type: node.type, isContainer: true },
    disabled: mode === 'preview' || !isContainer,
  });
  const handleClick = (e: React.MouseEvent) => {
    if (mode === 'edit') {
      e.stopPropagation();
      onSelect(node.id);
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
          onSelect={onSelect}
        />
      ))}
    </ComponentRegistry>
  );
  if (mode === 'preview') {
    return content;
  }
  // Edit Mode Wrapper
  return (
    <div
      ref={isContainer ? setNodeRef : undefined}
      onClick={handleClick}
      className={cn(
        "relative transition-all duration-200 group",
        isSelected && "ring-2 ring-primary ring-offset-2 rounded-sm z-10",
        !isSelected && "hover:ring-1 hover:ring-primary/50 hover:rounded-sm",
        isOver && "bg-primary/10 ring-2 ring-primary border-primary border-dashed",
        // Add some spacing for empty containers to make them droppable
        isContainer && node.children.length === 0 && "min-h-[80px] flex items-center justify-center"
      )}
    >
      {/* Label Tag for Selected Item */}
      {isSelected && (
        <div className="absolute -top-6 left-0 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-t-md font-medium z-20 uppercase tracking-wider">
          {node.type}
        </div>
      )}
      {/* Empty State for Containers */}
      {isContainer && node.children.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-xs text-muted-foreground/50 font-medium">Drop items here</span>
        </div>
      )}
      {content}
    </div>
  );
};
export function CanvasRenderer() {
  const components = useBuilderStore((s) => s.components);
  const mode = useBuilderStore((s) => s.mode);
  const selectedId = useBuilderStore((s) => s.selectedId);
  const selectComponent = useBuilderStore((s) => s.selectComponent);
  // Root Droppable Area
  const { setNodeRef, isOver } = useDroppable({
    id: 'root',
    data: { isRoot: true },
    disabled: mode === 'preview',
  });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-full w-full p-8 transition-colors duration-300",
        mode === 'edit' && "bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px]",
        isOver && mode === 'edit' && "bg-primary/5"
      )}
      onClick={() => mode === 'edit' && selectComponent(null)}
    >
      <div className={cn(
        "max-w-5xl mx-auto min-h-[80vh] bg-background shadow-sm border border-border rounded-xl p-8 transition-all",
        mode === 'preview' && "shadow-none border-none p-0 max-w-full"
      )}>
        {components.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 min-h-[400px]">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
              <span className="text-2xl">✨</span>
            </div>
            <div className="text-center">
              <h3 className="font-medium text-foreground">Canvas is Empty</h3>
              <p className="text-sm">Drag components from the sidebar to start building.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {components.map((node) => (
              <CanvasNode
                key={node.id}
                node={node}
                mode={mode}
                selectedId={selectedId}
                onSelect={selectComponent}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}