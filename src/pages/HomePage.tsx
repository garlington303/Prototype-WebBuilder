import React, { useRef } from 'react';
import { DndContext, DragOverlay, useSensor, useSensors, MouseSensor, TouchSensor, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { BuilderSidebar } from '@/components/builder/builder-sidebar';
import { PropertiesPanel } from '@/components/builder/properties-panel';
import { CanvasRenderer } from '@/components/builder/canvas-renderer';
import { BuilderHeader } from '@/components/builder/builder-header';
import { useBuilderStore, ComponentType } from '@/store/builder-store';
import { Toaster } from '@/components/ui/sonner';
import { COMPONENT_ICONS, COMPONENT_LABELS } from '@/components/builder/component-constants';
import { Box, MousePointerClick, LayoutTemplate, Heading, Type, FormInput } from 'lucide-react';

// Map icons for overlay
const Icons: Record<string, any> = {
  Box,
  MousePointerClick,
  LayoutTemplate,
  Heading,
  Type,
  FormInput
};

export function HomePage() {
  const addComponent = useBuilderStore((s) => s.addComponent);
  const [activeDragType, setActiveDragType] = React.useState<ComponentType | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10, // Require 10px movement to start drag
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.isSidebarItem) {
      setActiveDragType(active.data.current.type as ComponentType);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active } = event;
    setActiveDragType(null);

    // Handle dropping sidebar item onto canvas - use pointer coordinates for free-form placement
    if (active.data.current?.isSidebarItem && canvasContainerRef.current) {
      const type = active.data.current.type as ComponentType;
      
      // Get the canvas container bounds to calculate relative position
      const canvasRect = canvasContainerRef.current.getBoundingClientRect();
      const scrollLeft = canvasContainerRef.current.scrollLeft;
      const scrollTop = canvasContainerRef.current.scrollTop;
      
      // Get the pointer position from the event
      // DragEndEvent doesn't have direct coordinates, so we use a workaround
      // The activatorEvent contains the original mouse event
      const pointerX = (event.activatorEvent as MouseEvent)?.clientX ?? canvasRect.left + 100;
      const pointerY = (event.activatorEvent as MouseEvent)?.clientY ?? canvasRect.top + 100;
      
      // Calculate position relative to canvas, accounting for scroll
      const x = pointerX - canvasRect.left + scrollLeft;
      const y = pointerY - canvasRect.top + scrollTop;
      
      addComponent(type, { x: Math.max(20, x - 50), y: Math.max(20, y - 20) });
    }
  };

  const ActiveIcon = activeDragType ? Icons[COMPONENT_ICONS[activeDragType]] : null;

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      <BuilderHeader />
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex overflow-hidden">
          <BuilderSidebar />
          <main 
            ref={canvasContainerRef}
            className="flex-1 overflow-auto relative bg-muted/5 scrollbar-thin scrollbar-thumb-border"
          >
            <CanvasRenderer />
          </main>
          <PropertiesPanel />
        </div>
        <DragOverlay>
          {activeDragType && ActiveIcon ? (
            <div className="flex items-center gap-3 p-3 rounded-md border border-primary bg-background shadow-xl opacity-90 cursor-grabbing ring-2 ring-primary">
              <div className="p-2 bg-primary/10 rounded-md">
                <ActiveIcon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">{COMPONENT_LABELS[activeDragType]}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      <Toaster richColors position="bottom-right" />
    </div>
  );
}