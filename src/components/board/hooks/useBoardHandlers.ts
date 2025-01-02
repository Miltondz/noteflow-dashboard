import { useToast } from "@/components/ui/use-toast";
import { NoteData } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { getRandomStickyNoteColor } from "../utils/boardUtils";
import { transformDbToNote } from "../utils/boardTransformers";

export const useBoardHandlers = (
  notes: NoteData[],
  setNotes: (notes: NoteData[] | ((prev: NoteData[]) => NoteData[])) => void,
  dashboardId: string | null,
  updatePositionMutation: any,
  updateContentMutation: any,
  deleteComponentMutation: any,
  onNotesChange?: (notes: NoteData[]) => void,
) => {
  const { toast } = useToast();

  const handleNoteMove = (id: string, newPosition: { x: number; y: number }) => {
    setNotes((prev: NoteData[]) =>
      prev.map((note) =>
        note.id === id ? { ...note, position: newPosition } : note
      )
    );
    
    const position_x = typeof newPosition.x === 'number' ? newPosition.x : 0;
    const position_y = typeof newPosition.y === 'number' ? newPosition.y : 0;
    
    updatePositionMutation.mutate({
      id,
      position_x,
      position_y,
    });
  };

  const handleAddNote = async (type: NoteData["type"], position?: { x: number; y: number }) => {
    if (!dashboardId) {
      toast({
        title: "Error",
        description: "Dashboard not ready. Please try again in a moment.",
        variant: "destructive",
      });
      return;
    }

    try {
      const defaultPosition = position || {
        x: Math.max(50, Math.random() * (window.innerWidth - 350)),
        y: Math.max(50, Math.random() * (window.innerHeight - 350))
      };

      const { data, error } = await supabase
        .from('dashboard_components')
        .insert([{
          dashboard_id: dashboardId,
          type: type,
          content: type === "sticky-note" 
            ? "New note" 
            : type === "document" 
            ? "Start typing your document..." 
            : "",
          position_x: defaultPosition.x,
          position_y: defaultPosition.y,
          style: type === "sticky-note" 
            ? { backgroundColor: getRandomStickyNoteColor() }
            : type === "document" 
            ? { backgroundColor: "#1A1F2C", color: "#ffffff" }
            : {},
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newNote = transformDbToNote(data);
        setNotes((prev: NoteData[]) => [...prev, newNote]);
        onNotesChange?.([...notes, newNote]);
        
        toast({
          title: "Success",
          description: `New ${type} added successfully!`,
        });
      }
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleContentChange = (id: string, content: string) => {
    setNotes((prev: NoteData[]) =>
      prev.map((note) =>
        note.id === id ? { ...note, content } : note
      )
    );
    updateContentMutation.mutate({ id, content });
  };

  const handleToggleExpand = (id: string) => {
    setNotes((prev: NoteData[]) =>
      prev.map((note) =>
        note.id === id ? { ...note, isExpanded: !note.isExpanded } : note
      )
    );
  };

  const handleDelete = (id: string) => {
    setNotes((prev: NoteData[]) => prev.filter(n => n.id !== id));
    onNotesChange?.(notes.filter(n => n.id !== id));
    deleteComponentMutation.mutate(id);
  };

  return {
    handleNoteMove,
    handleAddNote,
    handleContentChange,
    handleToggleExpand,
    handleDelete,
  };
};