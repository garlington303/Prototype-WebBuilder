import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface DropZoneProps {
  id: string;
  isEditMode: boolean;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  label?: string;
}

export function DropZone({
  id,
  isEditMode,
  className = '',
  orientation = 'horizontal',
  label,
}: DropZoneProps) {
  const { isOver, setNodeRef, active } = useDroppable({
    id,
  });

  // Only show when in edit mode and something is being dragged
  if (!isEditMode) {
    return null;
  }

  const isActive = !!active;
  const showZone = isActive || isOver;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'transition-all duration-200',
        orientation === 'horizontal' ? 'h-2 w-full my-1' : 'w-2 h-full mx-1',
        showZone && (orientation === 'horizontal' ? 'h-16' : 'w-16'),
        className
      )}
    >
      <div
        className={cn(
          'w-full h-full rounded-lg border-2 border-dashed transition-all duration-200 flex items-center justify-center',
          isOver
            ? 'border-lime-400 bg-lime-400/10'
            : showZone
            ? 'border-purple-500/50 bg-purple-500/5'
            : 'border-transparent'
        )}
      >
        {showZone && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium transition-all',
            isOver ? 'text-lime-400' : 'text-purple-400/70'
          )}>
            <Plus className="w-3 h-3" />
            {label && <span>{label}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// SECTION DROP ZONE (for between sortable items)
// ============================================
interface SectionDropZoneProps {
  id: string;
  isEditMode: boolean;
  position: 'before' | 'after';
  sectionId: string;
}

export function SectionDropZone({
  id,
  isEditMode,
  position,
  sectionId,
}: SectionDropZoneProps) {
  const { isOver, setNodeRef, active } = useDroppable({
    id: `${id}-${position}-${sectionId}`,
    data: {
      position,
      targetSectionId: sectionId,
    },
  });

  if (!isEditMode) {
    return null;
  }

  const isActive = !!active;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'h-1 w-full transition-all duration-150',
        isActive && 'h-3',
        isOver && 'h-8'
      )}
    >
      <div
        className={cn(
          'w-full h-full rounded transition-all duration-150',
          isOver
            ? 'bg-lime-400/30 border border-lime-400'
            : isActive
            ? 'bg-purple-500/10'
            : 'bg-transparent'
        )}
      />
    </div>
  );
}

// ============================================
// DROPPABLE AREA (for sidebar/main containers)
// ============================================
interface DroppableAreaProps {
  id: string;
  children: React.ReactNode;
  isEditMode: boolean;
  className?: string;
  label?: string;
  emptyMessage?: string;
}

export function DroppableArea({
  id,
  children,
  isEditMode,
  className = '',
  label,
  emptyMessage = 'Drop components here',
}: DroppableAreaProps) {
  const { isOver, setNodeRef, active } = useDroppable({
    id,
    data: {
      isContainer: true,
      containerId: id,
    },
  });

  const isActive = !!active;
  const childCount = React.Children.count(children);
  const isEmpty = childCount === 0;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative transition-all duration-200',
        isEditMode && isOver && 'ring-2 ring-lime-400/50 ring-inset',
        isEditMode && isActive && !isOver && 'ring-1 ring-purple-500/30 ring-inset',
        className
      )}
    >
      {/* Container Label */}
      {isEditMode && label && (
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-zinc-800/80 backdrop-blur text-zinc-400 text-[10px] font-medium uppercase tracking-wider rounded z-20">
          {label}
        </div>
      )}

      {/* Empty State */}
      {isEditMode && isEmpty && (
        <div
          className={cn(
            'absolute inset-4 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors',
            isOver
              ? 'border-lime-400 bg-lime-400/5'
              : isActive
              ? 'border-purple-500/50 bg-purple-500/5'
              : 'border-zinc-700/50'
          )}
        >
          <div className={cn(
            'text-sm font-medium',
            isOver ? 'text-lime-400' : 'text-zinc-600'
          )}>
            {emptyMessage}
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
