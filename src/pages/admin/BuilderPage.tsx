import React, { useRef, useState, useEffect } from 'react';
import { DndContext, DragOverlay, useSensor, useSensors, MouseSensor, TouchSensor, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { BuilderSidebar } from '@/components/builder/builder-sidebar';
import { PropertiesPanel } from '@/components/builder/properties-panel';
import { CanvasRenderer } from '@/components/builder/canvas-renderer';
import { BuilderHeader } from '@/components/builder/builder-header';
import { useBuilderStore, ComponentType } from '@/store/builder-store';
import { Toaster } from '@/components/ui/sonner';
import { COMPONENT_ICONS, COMPONENT_LABELS } from '@/components/builder/component-constants';
import { Box, MousePointerClick, LayoutTemplate, Heading, Type, FormInput, Lock, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Map icons for overlay
const Icons: Record<string, any> = {
  Box,
  MousePointerClick,
  LayoutTemplate,
  Heading,
  Type,
  FormInput
};

// Password protection configuration
const BUILDER_PASSWORD = import.meta.env.VITE_BUILDER_PASSWORD || 'dev-studio-2025';
const AUTH_STORAGE_KEY = '__dds_builder_auth';

function PasswordGate({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === BUILDER_PASSWORD) {
      // Store auth token in sessionStorage (cleared when browser closes)
      sessionStorage.setItem(AUTH_STORAGE_KEY, btoa(Date.now().toString()));
      onAuthenticated();
    } else {
      setError('Invalid password');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="w-full max-w-md p-8">
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Dev Studio Access</h1>
            <p className="text-zinc-400 text-sm mt-2">Enter password to access the builder</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter password..."
                className="w-full bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 pr-10 h-12 rounded-xl"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center animate-pulse">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/20"
            >
              Access Builder
            </Button>
          </form>

          <p className="text-zinc-500 text-xs text-center mt-6">
            This is a protected development environment
          </p>
        </div>
      </div>
    </div>
  );
}

export function BuilderPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const addComponent = useBuilderStore((s) => s.addComponent);
  const [activeDragType, setActiveDragType] = React.useState<ComponentType | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Check for existing auth on mount
  useEffect(() => {
    const authToken = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (authToken) {
      try {
        const timestamp = parseInt(atob(authToken));
        // Auth valid for 24 hours
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          setIsAuthenticated(true);
        } else {
          sessionStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch {
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsChecking(false);
  }, []);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
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

    if (active.data.current?.isSidebarItem && canvasContainerRef.current) {
      const type = active.data.current.type as ComponentType;
      const canvasRect = canvasContainerRef.current.getBoundingClientRect();
      const scrollLeft = canvasContainerRef.current.scrollLeft;
      const scrollTop = canvasContainerRef.current.scrollTop;
      const pointerX = (event.activatorEvent as MouseEvent)?.clientX ?? canvasRect.left + 100;
      const pointerY = (event.activatorEvent as MouseEvent)?.clientY ?? canvasRect.top + 100;
      const x = pointerX - canvasRect.left + scrollLeft;
      const y = pointerY - canvasRect.top + scrollTop;
      addComponent(type, { x: Math.max(20, x - 50), y: Math.max(20, y - 20) });
    }
  };

  const ActiveIcon = activeDragType ? Icons[COMPONENT_ICONS[activeDragType]] : null;

  // Show loading while checking auth
  if (isChecking) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-950">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show password gate if not authenticated
  if (!isAuthenticated) {
    return <PasswordGate onAuthenticated={() => setIsAuthenticated(true)} />;
  }

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
