import { Button } from "@/components/ui/button";
import { StickyNote, FileText, Image, Type, ListTodo } from "lucide-react";
import { NoteData } from "../types";

interface ToolbarProps {
  onAddNote: (type: NoteData["type"], position?: { x: number; y: number }) => void;
}

export function Toolbar({ onAddNote }: ToolbarProps) {
  const handleDragStart = (e: React.DragEvent, type: NoteData["type"]) => {
    e.dataTransfer.setData("application/lovable-type", type);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="h-12 border-b flex items-center gap-2 px-4 bg-background">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onAddNote("sticky-note")}
        draggable
        onDragStart={(e) => handleDragStart(e, "sticky-note")}
      >
        <StickyNote className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onAddNote("document")}
        draggable
        onDragStart={(e) => handleDragStart(e, "document")}
      >
        <FileText className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onAddNote("image")}
        draggable
        onDragStart={(e) => handleDragStart(e, "image")}
      >
        <Image className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onAddNote("text")}
        draggable
        onDragStart={(e) => handleDragStart(e, "text")}
      >
        <Type className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onAddNote("todo-list")}
        draggable
        onDragStart={(e) => handleDragStart(e, "todo-list")}
      >
        <ListTodo className="h-4 w-4" />
      </Button>
    </div>
  );
}