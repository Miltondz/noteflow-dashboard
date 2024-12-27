import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Minimize2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NoteProps {
  id: string;
  type: "sticky-note" | "document" | "image";
  content: string;
  position: { x: number; y: number };
  isExpanded?: boolean;
  onMove: (id: string, position: { x: number; y: number }) => void;
  onContentChange: (id: string, content: string) => void;
  onToggleExpand: (id: string) => void;
}

export function Note({ 
  id, 
  type, 
  content, 
  position, 
  isExpanded = true,
  onMove, 
  onContentChange,
  onToggleExpand 
}: NoteProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === "TEXTAREA") return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    onMove(id, {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <Card
      className={cn(
        "absolute p-4 cursor-move shadow-lg transition-all duration-200",
        isDragging && "shadow-xl",
        type === "document" ? (isExpanded ? "w-96 h-96" : "w-48 h-48") : (isExpanded ? "w-64 h-64" : "w-32 h-32")
      )}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="flex justify-between mb-2">
        <div className="text-sm text-gray-500 capitalize">{type.replace("-", " ")}</div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onToggleExpand(id)}
        >
          {isExpanded ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="w-full h-[calc(100%-2rem)] overflow-auto">
        {type === "image" ? (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
            {content}
          </div>
        ) : (
          <Textarea
            value={content}
            onChange={(e) => onContentChange(id, e.target.value)}
            className={cn(
              "w-full h-full resize-none border-none focus-visible:ring-0 p-0",
              type === "document" && "font-serif text-base leading-relaxed"
            )}
            placeholder={type === "sticky-note" ? "Add a note..." : "Start typing your document..."}
          />
        )}
      </div>
    </Card>
  );
}