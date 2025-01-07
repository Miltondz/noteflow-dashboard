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
        const board = noteRef.current.closest('.board') as HTMLElement;
        if (!board) return;

        const boardRect = board.getBoundingClientRect();
        
        // Calculate new position with more flexible boundaries
        let newX = e.clientX - dragStart.x;
        let newY = e.clientY - dragStart.y;
        
        // Allow components to be dragged with minimal restrictions
        const minX = -noteRef.current.offsetWidth / 2;
        const minY = -noteRef.current.offsetHeight / 2;
        const maxX = boardRect.width + noteRef.current.offsetWidth / 2;
        const maxY = boardRect.height + noteRef.current.offsetHeight / 2;
        
        // Apply less restrictive boundaries
        newX = Math.max(minX, Math.min(newX, maxX));
        newY = Math.max(minY, Math.min(newY, maxY));
        
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
    if ((e.target as HTMLElement).tagName === "TEXTAREA") return;
    if (!(e.target as HTMLElement).closest('.note-header')) return;
    
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
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