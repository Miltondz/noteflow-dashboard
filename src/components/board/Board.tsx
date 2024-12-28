import { useState, useEffect } from "react";
import { Note } from "./Note";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface NoteData {
  id: string;
  type: "sticky-note" | "document" | "image";
  content: string;
  position: { x: number; y: number };
  isExpanded?: boolean;
  style?: Record<string, string>;
}

const STICKY_NOTE_COLORS = [
  "#F2FCE2", // Soft Green
  "#FEF7CD", // Soft Yellow
  "#FEC6A1", // Soft Orange
  "#E5DEFF", // Soft Purple
  "#FFDEE2", // Soft Pink
  "#FDE1D3", // Soft Peach
  "#D3E4FD", // Soft Blue
];

export function Board() {
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [dashboardId, setDashboardId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    createDefaultDashboard();
  }, []);

  const createDefaultDashboard = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a dashboard.",
          variant: "destructive",
        });
        return;
      }

      const { data: existingDashboards, error: fetchError } = await supabase
        .from('dashboards')
        .select('id')
        .limit(1);

      if (fetchError) throw fetchError;

      if (existingDashboards && existingDashboards.length > 0) {
        setDashboardId(existingDashboards[0].id);
        return;
      }

      const { data: newDashboard, error: createError } = await supabase
        .from('dashboards')
        .insert([
          {
            title: 'My Dashboard',
            description: 'My personal dashboard',
            is_public: false,
            owner_id: user.id
          }
        ])
        .select()
        .single();

      if (createError) throw createError;

      if (newDashboard) {
        setDashboardId(newDashboard.id);
      }
    } catch (error) {
      console.error('Error setting up dashboard:', error);
      toast({
        title: "Error",
        description: "Failed to set up dashboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNoteMove = (id: string, newPosition: { x: number; y: number }) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, position: newPosition } : note
      )
    );
  };

  const getRandomStickyNoteColor = () => {
    return STICKY_NOTE_COLORS[Math.floor(Math.random() * STICKY_NOTE_COLORS.length)];
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

    const style = type === "sticky-note" 
      ? { backgroundColor: getRandomStickyNoteColor() }
      : type === "document" 
      ? { backgroundColor: "#1A1F2C", color: "#ffffff" }
      : {};

    const newNote: NoteData = {
      id: crypto.randomUUID(),
      type,
      content: type === "sticky-note" 
        ? "New note" 
        : type === "document" 
        ? "Start typing your document..." 
        : "",
      position: position || { x: Math.random() * 300, y: Math.random() * 300 },
      isExpanded: true,
      style,
    };

    try {
      const { data, error } = await supabase
        .from('dashboard_components')
        .insert([{
          dashboard_id: dashboardId,
          type: newNote.type,
          content: newNote.content,
          position_x: Number(newNote.position.x),
          position_y: Number(newNote.position.y),
          style: newNote.style,
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const formattedNote = {
          ...newNote,
          id: data.id,
        };
        setNotes((prev) => [...prev, formattedNote]);
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
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, content } : note
      )
    );
  };

  const handleToggleExpand = (id: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, isExpanded: !note.isExpanded } : note
      )
    );
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("application/lovable-type") as NoteData["type"];
    if (!type) return;

    const boardRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const position = {
      x: e.clientX - boardRect.left,
      y: e.clientY - boardRect.top,
    };

    handleAddNote(type, position);
  };

  return (
    <div 
      className="w-full h-full relative bg-gray-50 board"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {notes.map((note) => (
        <Note
          key={note.id}
          {...note}
          onMove={handleNoteMove}
          onContentChange={handleContentChange}
          onToggleExpand={handleToggleExpand}
        />
      ))}
    </div>
  );
}