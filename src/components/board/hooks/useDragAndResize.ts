import { useState, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

interface UseDragAndResizeProps {
  id: string;
  position: Position;
  onMove: (id: string, position: Position) => void;
  noteRef: React.RefObject<HTMLDivElement>;
}

export const useDragAndResize = ({ id, position, onMove, noteRef }: UseDragAndResizeProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 256, height: 256 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging && !isResizing) return;
      
      e.preventDefault();
      
      if (isDragging && noteRef.current) {
        // Calculate new position without strict boundaries
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
        onMove(id, { x: newX, y: newY });
      } else if (isResizing && noteRef.current) {
        const rect = noteRef.current.getBoundingClientRect();
        const newWidth = Math.max(200, e.clientX - rect.left);
        const newHeight = Math.max(200, e.clientY - rect.top);
        setDimensions({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      if (isDragging || isResizing) {
        setIsDragging(false);
        setIsResizing(false);
        document.body.style.userSelect = '';
      }
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, isResizing, dragStart, id, onMove, noteRef]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow dragging from the note header
    if ((e.target as HTMLElement).closest('.note-header')) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
  };

  return {
    isDragging,
    dimensions,
    handleMouseDown,
    handleResizeStart,
  };
};