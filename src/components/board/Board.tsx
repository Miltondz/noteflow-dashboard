import { useState, useEffect } from "react";
import { Note } from "./Note";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { NoteData } from "./types";
import { useBoardQueries } from "./hooks/useBoardQueries";
import { getRandomStickyNoteColor } from "./utils/boardUtils";
import { BoardHeader } from "./components/BoardHeader";

interface BoardProps {
  onNotesChange?: (notes: NoteData[]) => void;
  onCleanDashboardInit?: (fn: () => void) => void;
}

export function Board({ onNotesChange, onCleanDashboardInit }: BoardProps) {
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [dashboardId, setDashboardId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const {
    components,
    updatePositionMutation,
    updateContentMutation,
    deleteComponentMutation,
    cleanDashboardMutation,
    queryClient
  } = useBoardQueries(dashboardId);

  // Transform database format to frontend format
  const transformDbToNote = (dbComponent: any): NoteData => ({
    id: dbComponent.id,
    type: dbComponent.type,
    content: dbComponent.content,
    position: { x: dbComponent.position_x, y: dbComponent.position_y },
    style: dbComponent.style as Record<string, any>,
    isExpanded: true,
  });

  // Transform frontend format to database format
  const transformNoteToDb = (note: NoteData) => ({
    position_x: note.position.x,
    position_y: note.position.y,
    content: note.content,
    style: note.style,
  });

  useEffect(() => {
    if (components) {
      const formattedComponents = components.map(transformDbToNote);
      setNotes(formattedComponents);
      onNotesChange?.(formattedComponents);
    }
  }, [components, onNotesChange]);

  useEffect(() => {
    createDefaultDashboard();
  }, []);

  useEffect(() => {
    if (onCleanDashboardInit) {
      onCleanDashboardInit(() => handleCleanDashboard);
    }
  }, [onCleanDashboardInit, dashboardId]);

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
    updatePositionMutation.mutate({
      id,
      position_x: newPosition.x,
      position_y: newPosition.y,
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
          position_x: position?.x || Math.random() * (window.innerWidth - 300),
          position_y: position?.y || Math.random() * (window.innerHeight - 300),
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
        setNotes(prev => [...prev, newNote]);
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
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, content } : note
      )
    );
    updateContentMutation.mutate({ id, content });
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

  const handleCleanDashboard = () => {
    if (!dashboardId) return;
    cleanDashboardMutation.mutate(dashboardId);
  };

  return (
    <div 
      className="w-full h-full relative bg-gray-50 dark:bg-gray-900 board overflow-hidden"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <BoardHeader dashboardId={dashboardId} notes={notes} />
      {notes.map((note) => (
        <Note
          key={note.id}
          {...note}
          onMove={handleNoteMove}
          onContentChange={handleContentChange}
          onToggleExpand={handleToggleExpand}
          onDelete={(id) => {
            setNotes(prev => prev.filter(n => n.id !== id));
            onNotesChange?.(notes.filter(n => n.id !== id));
            deleteComponentMutation.mutate(id);
          }}
        />
      ))}
    </div>
  );
}