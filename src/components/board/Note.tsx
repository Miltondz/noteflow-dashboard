import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Minimize2, Maximize2, Upload, Trash2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { NoteData } from "./types";

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
  const { toast } = useToast();

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

  const renderContent = () => {
    if (type === "image") {
      return (
        <div 
          className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400"
          onClick={() => fileInputRef.current?.click()}
        >
          {content ? (
            <img src={content} alt="Note" className="w-full h-full object-cover" />
          ) : (
            <>
              <Upload className="w-8 h-8 mb-2" />
              <span>Click to upload image</span>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </>
          )}
        </div>
      );
    }

    return (
      <Textarea
        value={content}
        onChange={(e) => onContentChange(id, e.target.value)}
        className={cn(
          "w-full h-full resize-none border-none focus-visible:ring-0 p-0",
          type === "document" && "font-serif text-base leading-relaxed bg-transparent",
          type === "text" && "text-base leading-relaxed"
        )}
        placeholder={
          type === "sticky-note" 
            ? "Add a note..." 
            : type === "document" 
            ? "Start typing your document..." 
            : "Start typing..."
        }
        style={type === "document" ? { color: "inherit" } : undefined}
      />
    );
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
        ...style,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="flex justify-between mb-2">
        <div className="text-sm text-gray-500 capitalize">{type.replace("-", " ")}</div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onDelete(id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
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
      </div>
      <div className="w-full h-[calc(100%-2rem)] overflow-auto">
        {renderContent()}
      </div>
    </Card>
  );
}