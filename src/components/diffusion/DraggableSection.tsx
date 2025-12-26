import React, { useState, useRef, useCallback } from 'react';
import { GripVertical, Lock, Unlock, Settings } from 'lucide-react';

interface DraggableSectionProps {
  id: string;
  label: string;
  children: React.ReactNode;
  isEditMode: boolean;
  isLocked?: boolean;
  onLockToggle?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function DraggableSection({
  id,
  label,
  children,
  isEditMode,
  isLocked = false,
  onLockToggle,
  className = '',
  style,
}: DraggableSectionProps) {
  const [isSelected, setIsSelected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!isEditMode) return;
    e.stopPropagation();
    setIsSelected(true);
  }, [isEditMode]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isEditMode || isLocked) return;
    e.preventDefault();
    setIsDragging(true);
    // Basic drag visual feedback
  }, [isEditMode, isLocked]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Deselect when clicking elsewhere
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sectionRef.current && !sectionRef.current.contains(e.target as Node)) {
        setIsSelected(false);
      }
    };
    if (isEditMode) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditMode]);

  return (
    <div
      ref={sectionRef}
      onClick={handleClick}
      onMouseUp={handleMouseUp}
      className={`relative ${className} ${isEditMode ? 'group' : ''}`}
      style={{
        ...style,
        cursor: isEditMode && !isLocked ? 'move' : 'default',
        opacity: isDragging ? 0.8 : 1,
      }}
    >
      {/* Edit Mode Overlay */}
      {isEditMode && (
        <>
          {/* Selection Border */}
          <div
            className={`absolute inset-0 pointer-events-none z-40 border-2 transition-colors ${
              isSelected
                ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                : 'border-transparent group-hover:border-lime-400/50'
            }`}
          />

          {/* Section Label */}
          <div
            className={`absolute -top-6 left-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-t z-50 flex items-center gap-1 ${
              isSelected ? 'bg-purple-500 text-white' : 'bg-zinc-700 text-zinc-300'
            }`}
          >
            <GripVertical className="w-3 h-3" onMouseDown={handleMouseDown} />
            <span>{label}</span>
            {isLocked ? (
              <Lock className="w-3 h-3 text-zinc-400" />
            ) : null}
          </div>

          {/* Quick Actions */}
          {isSelected && (
            <div className="absolute -top-6 right-2 flex items-center gap-1 z-50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLockToggle?.();
                }}
                className={`p-1 rounded text-xs ${
                  isLocked
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                }`}
                title={isLocked ? 'Unlock Section' : 'Lock Section'}
              >
                {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Future: Open properties panel
                }}
                className="p-1 rounded text-xs bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                title="Section Settings"
              >
                <Settings className="w-3 h-3" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Actual Content */}
      {children}
    </div>
  );
}
