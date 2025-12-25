import React, { useState } from 'react';
import { useBuilderStore, Component } from '@/store/builder-store';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronDown, Box, MousePointerClick, LayoutTemplate, Heading, Type, FormInput, Layers } from 'lucide-react';
import { COMPONENT_LABELS } from './component-constants';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const getIconForType = (type: string) => {
  switch (type) {
    case 'container': return Box;
    case 'button': return MousePointerClick;
    case 'card': return LayoutTemplate;
    case 'header': return Heading;
    case 'text': return Type;
    case 'input': return FormInput;
    default: return Box;
  }
};

interface LayerItemProps {
  node: Component;
  depth?: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const SortableLayerItem: React.FC<LayerItemProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: props.node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <LayerItem {...props} />
    </div>
  );
};

const LayerItem: React.FC<LayerItemProps> = ({ node, depth = 0, selectedId, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const Icon = getIconForType(node.type);
  const isSelected = selectedId === node.id;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node.id);
  };

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center py-1 px-2 cursor-pointer hover:bg-accent/50 text-sm transition-colors",
          isSelected && "bg-accent text-accent-foreground font-medium"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleSelect}
      >
        <div 
          className={cn(
            "mr-1 p-0.5 rounded-sm hover:bg-muted/80 transition-colors", 
            !hasChildren && "opacity-0 pointer-events-none"
          )}
          onClick={handleToggle}
          onMouseDown={(e) => e.stopPropagation()} // Prevent drag start when clicking toggle
        >
          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </div>
        
        <Icon className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
        <span className="truncate">{COMPONENT_LABELS[node.type] || node.type}</span>
        {node.props.name && <span className="ml-2 text-xs text-muted-foreground truncate">- {node.props.name}</span>}
      </div>

      {hasChildren && isExpanded && (
        <div className="pl-2">
          <SortableContext 
            items={node.children.map(c => c.id)} 
            strategy={verticalListSortingStrategy}
          >
            {node.children.map((child) => (
              <SortableLayerItem
                key={child.id}
                node={child}
                depth={depth + 1}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  );
};

export function LayerTree() {
  const components = useBuilderStore((s) => s.components);
  const selectedId = useBuilderStore((s) => s.selectedId);
  const selectComponent = useBuilderStore((s) => s.selectComponent);
  const reorderComponent = useBuilderStore((s) => s.reorderComponent);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Require slight movement to start drag, preventing accidental drags on click
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      reorderComponent(active.id as string, over.id as string);
    }
  };

  if (components.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground p-4 text-center">
        <Layers className="h-8 w-8 mb-2 opacity-20" />
        <p className="text-xs">No layers yet</p>
        <p className="text-[10px] opacity-70">Add components to see them here</p>
      </div>
    );
  }

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter} 
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full overflow-y-auto py-2">
        <SortableContext 
          items={components.map(c => c.id)} 
          strategy={verticalListSortingStrategy}
        >
          {components.map((component) => (
            <SortableLayerItem
              key={component.id}
              node={component}
              selectedId={selectedId}
              onSelect={selectComponent}
            />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
}
