import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Lock, Unlock, Trash2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SortableSectionProps {
  id: string;
  label: string;
  children: React.ReactNode;
  isEditMode: boolean;
  isLocked?: boolean;
  onLockToggle?: () => void;
  onDelete?: () => void;
  className?: string;
  disabled?: boolean;
}

export function SortableSection({
  id,
  label,
  children,
  isEditMode,
  isLocked = false,
  onLockToggle,
  onDelete,
  className = '',
  disabled = false,
}: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id,
    disabled: !isEditMode || isLocked || disabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative',
        isEditMode && 'group',
        isOver && isEditMode && 'ring-2 ring-lime-400/50',
        className
      )}
    >
      {/* Edit Mode Overlay */}
      {isEditMode && (
        <>
          {/* Selection Border */}
          <div
            className={cn(
              'absolute inset-0 pointer-events-none z-40 border-2 rounded-lg transition-all',
              isDragging
                ? 'border-purple-500 shadow-lg shadow-purple-500/30'
                : 'border-transparent group-hover:border-purple-400/50'
            )}
          />

          {/* Section Label & Drag Handle */}
          <div
            className={cn(
              'absolute -top-6 left-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-t z-50 flex items-center gap-1 transition-all',
              isDragging
                ? 'bg-purple-500 text-white'
                : 'bg-zinc-700/80 text-zinc-300 group-hover:bg-purple-500/80 group-hover:text-white'
            )}
          >
            {/* Drag Handle */}
            <button
              {...attributes}
              {...listeners}
              className={cn(
                'cursor-grab active:cursor-grabbing p-0.5 -ml-1 rounded hover:bg-white/10',
                isLocked && 'cursor-not-allowed opacity-50'
              )}
              disabled={isLocked}
            >
              <GripVertical className="w-3 h-3" />
            </button>
            <span>{label}</span>
            {isLocked && <Lock className="w-3 h-3 text-zinc-400 ml-1" />}
          </div>

          {/* Quick Actions */}
          <div className="absolute -top-6 right-2 flex items-center gap-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLockToggle?.();
              }}
              className={cn(
                'p-1 rounded text-xs transition-colors',
                isLocked
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-zinc-700/80 text-zinc-300 hover:bg-zinc-600'
              )}
              title={isLocked ? 'Unlock Section' : 'Lock Section'}
            >
              {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Future: Open properties panel
              }}
              className="p-1 rounded text-xs bg-zinc-700/80 text-zinc-300 hover:bg-zinc-600 transition-colors"
              title="Section Settings"
            >
              <Settings className="w-3 h-3" />
            </button>

            {onDelete && !isLocked && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 rounded text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                title="Delete Section"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </>
      )}

      {/* Actual Content */}
      <div className={cn(isEditMode && 'pointer-events-none')}>
        {children}
      </div>
    </div>
  );
}

// ============================================
// DROPPABLE CONTAINER
// ============================================
interface DroppableContainerProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  isEditMode?: boolean;
  label?: string;
}

export function DroppableContainer({
  id,
  children,
  className = '',
  isEditMode = false,
  label,
}: DroppableContainerProps) {
  return (
    <div
      data-droppable-id={id}
      className={cn(
        'relative',
        isEditMode && 'min-h-[100px]',
        className
      )}
    >
      {isEditMode && label && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 bg-zinc-800 text-zinc-500 text-[10px] font-medium uppercase tracking-wider rounded z-10">
          {label}
        </div>
      )}
      {children}
    </div>
  );
}
