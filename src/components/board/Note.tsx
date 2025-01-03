import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { NoteData } from "./types";
import { NoteHeader } from "./components/NoteHeader";
import { NoteContent } from "./components/NoteContent";
import { useDragAndResize } from "./hooks/useDragAndResize";
import { useImageUpload } from "./hooks/useImageUpload";

type NoteProps = NoteData & {
  onMove: (id: string, position: { x: number; y: number }) => void;
  onContentChange: (id: string, content: string) => void;
  onToggleExpand: (id: string) => void;
  onDelete: (id: string) => void;
};

export function Note({ 
  id, 
  type, 
  content, 
  position, 
  isExpanded = true,
  style = {},
  onMove, 
  onContentChange,
  onToggleExpand,
  onDelete
}: NoteProps) {
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const {
    isDragging,
    dimensions,
    handleMouseDown,
    handleResizeStart,
  } = useDragAndResize({
    id,
    position,
    onMove,
    noteRef,
  });

  const { handleImageUpload } = useImageUpload(id, onContentChange);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('dashboard_components')
        .update({
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Changes saved successfully!",
      });
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card
      ref={noteRef}
      className={cn(
        "absolute p-4 shadow-lg transition-all duration-200",
        isDragging && "shadow-xl cursor-grabbing",
        !isDragging && "cursor-default",
        "relative"
      )}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        ...style,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="note-header">
        <NoteHeader
          type={type}
          isExpanded={isExpanded}
          isSaving={isSaving}
          onSave={handleSave}
          onDelete={() => onDelete(id)}
          onToggleExpand={() => onToggleExpand(id)}
        />
      </div>
      <div className="w-full h-[calc(100%-2rem)] overflow-auto">
        <NoteContent
          type={type}
          content={content}
          onContentChange={(content) => onContentChange(id, content)}
          fileInputRef={fileInputRef}
          handleImageUpload={handleImageUpload}
        />
      </div>
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onMouseDown={handleResizeStart}
        style={{
          background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.1) 50%)',
        }}
      />
    </Card>
  );
}