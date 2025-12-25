import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Box, MousePointerClick, LayoutTemplate, Heading, Type, FormInput, GripVertical, Layers, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComponentType } from '@/store/builder-store';
import { COMPONENT_LABELS } from './component-constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayerTree } from './layer-tree';

const DraggableItem = ({ type, label, icon: Icon }: { type: ComponentType; label: string; icon: any }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${type}`,
    data: { type, isSidebarItem: true },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "flex items-center gap-3 p-3 rounded-md border border-border bg-card hover:bg-accent hover:text-accent-foreground cursor-grab active:cursor-grabbing transition-all shadow-sm",
        isDragging && "opacity-50 ring-2 ring-primary"
      )}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      <div className="p-2 bg-secondary rounded-md">
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};

export function BuilderSidebar() {
  return (
    <aside className="w-64 border-r border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col h-full overflow-hidden">
      <Tabs defaultValue="add" className="flex flex-col h-full">
        <div className="p-2 border-b border-border">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="add" className="text-xs">
              <Plus className="h-3.5 w-3.5 mr-2" />
              Add
            </TabsTrigger>
            <TabsTrigger value="layers" className="text-xs">
              <Layers className="h-3.5 w-3.5 mr-2" />
              Layers
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="add" className="flex-1 overflow-y-auto p-4 space-y-6 m-0">
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground pl-1">Layout</h3>
            <DraggableItem type="container" label={COMPONENT_LABELS.container} icon={Box} />
            <DraggableItem type="card" label={COMPONENT_LABELS.card} icon={LayoutTemplate} />
          </div>
          
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground pl-1">Elements</h3>
            <DraggableItem type="button" label={COMPONENT_LABELS.button} icon={MousePointerClick} />
            <DraggableItem type="header" label={COMPONENT_LABELS.header} icon={Heading} />
            <DraggableItem type="text" label={COMPONENT_LABELS.text} icon={Type} />
            <DraggableItem type="input" label={COMPONENT_LABELS.input} icon={FormInput} />
          </div>
          
          <div className="pt-4 mt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Drag components to the canvas
            </p>
          </div>
        </TabsContent>

        <TabsContent value="layers" className="flex-1 overflow-hidden m-0">
          <LayerTree />
        </TabsContent>
      </Tabs>
    </aside>
  );
}