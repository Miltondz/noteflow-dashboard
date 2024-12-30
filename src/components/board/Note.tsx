import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { NoteData } from "./types";
import { NoteHeader } from "./components/NoteHeader";
import { NoteContent } from "./components/NoteContent";

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
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      e.preventDefault();
      onMove(id, {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        document.body.style.userSelect = '';
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragStart, id, onMove]);

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

      if (error) throw error;

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('dashboard-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('dashboard-images')
        .getPublicUrl(filePath);

      onContentChange(id, publicUrl);
      
      toast({
        title: "Success",
        description: "Image uploaded successfully!",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card
      ref={noteRef}
      className={cn(
        "absolute p-4 shadow-lg transition-all duration-200",
        isDragging && "shadow-xl cursor-grabbing",
        !isDragging && "cursor-default",
        type === "document" ? (isExpanded ? "w-96 h-96" : "w-48 h-48") : (isExpanded ? "w-64 h-64" : "w-32 h-32")
      )}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
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
    </Card>
  );
}