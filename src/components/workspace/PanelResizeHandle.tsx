/**
 * PanelResizeHandle
 * Draggable handle for resizing panels
 */

import React, { useCallback, useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// PROPS INTERFACE
// ============================================

interface PanelResizeHandleProps {
  panelId: string;
  position: 'left' | 'right' | 'top' | 'bottom';
  onResize: (delta: number) => void;
  className?: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export const PanelResizeHandle: React.FC<PanelResizeHandleProps> = ({
  panelId,
  position,
  onResize,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef<number>(0);
  
  const isHorizontal = position === 'left' || position === 'right';
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startPosRef.current = isHorizontal ? e.clientX : e.clientY;
    
    // Add cursor style to body during drag
    document.body.style.cursor = isHorizontal ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  }, [isHorizontal]);
  
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const currentPos = isHorizontal ? e.clientX : e.clientY;
      const delta = currentPos - startPosRef.current;
      
      if (Math.abs(delta) > 1) {
        onResize(delta);
        startPosRef.current = currentPos;
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isHorizontal, onResize]);
  
  return (
    <div
      onMouseDown={handleMouseDown}
      className={cn(
        'absolute z-10 transition-colors duration-150',
        'group',
        // Position
        position === 'left' && 'left-0 top-0 bottom-0 w-1 -translate-x-1/2 cursor-col-resize',
        position === 'right' && 'right-0 top-0 bottom-0 w-1 translate-x-1/2 cursor-col-resize',
        position === 'top' && 'top-0 left-0 right-0 h-1 -translate-y-1/2 cursor-row-resize',
        position === 'bottom' && 'bottom-0 left-0 right-0 h-1 translate-y-1/2 cursor-row-resize',
        className
      )}
    >
      {/* Visual handle indicator */}
      <div
        className={cn(
          'absolute bg-border transition-all duration-150',
          'group-hover:bg-primary/50',
          isDragging && 'bg-primary',
          isHorizontal
            ? 'w-0.5 h-full left-1/2 -translate-x-1/2'
            : 'h-0.5 w-full top-1/2 -translate-y-1/2',
        )}
      />
      
      {/* Hover/active expansion area */}
      <div
        className={cn(
          'absolute transition-all duration-150',
          'opacity-0 group-hover:opacity-100',
          isDragging && 'opacity-100',
          isHorizontal
            ? 'w-1 h-12 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20'
            : 'h-1 w-12 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20',
        )}
      />
    </div>
  );
};

export default PanelResizeHandle;
