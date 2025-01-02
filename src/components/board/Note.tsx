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
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: type === "document" ? 384 : 256, height: type === "document" ? 384 : 256 });
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging && !isResizing) return;
      
      e.preventDefault();
      if (isDragging && noteRef.current) {
        const board = noteRef.current.closest('.board') as HTMLElement;
        if (!board) return;

        const boardRect = board.getBoundingClientRect();
        const noteRect = noteRef.current.getBoundingClientRect();
        
        // Calculate new position
        let newX = e.clientX - dragStart.x;
        let newY = e.clientY - dragStart.y;
        
        // Add bounds checking
        newX = Math.max(0, Math.min(newX, boardRect.width - noteRect.width));
        newY = Math.max(0, Math.min(newY, boardRect.height - noteRect.height));
        
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
  }, [isDragging, isResizing, dragStart, id, onMove]);

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