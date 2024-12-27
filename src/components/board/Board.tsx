import { useState } from "react";
import { Note } from "./Note";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

interface NoteData {
  id: string;
  type: "sticky-note" | "document" | "image";
  content: string;
  position: { x: number; y: number };
  isExpanded?: boolean;
}

export function Board() {
  const [notes, setNotes] = useState<NoteData[]>([
    { id: "1", type: "sticky-note", content: "Welcome to your board!", position: { x: 100, y: 100 } },
  ]);

  const handleNoteMove = (id: string, newPosition: { x: number; y: number }) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, position: newPosition } : note
      )
    );
  };

  const handleAddNote = async (type: NoteData["type"]) => {
    const newNote: NoteData = {
      id: crypto.randomUUID(),
      type,
      content: type === "sticky-note" 
        ? "New note" 
        : type === "document" 
        ? "Start typing your document..." 
        : "Click to add image",
      position: { x: Math.random() * 300, y: Math.random() * 300 },
      isExpanded: true,
    };

    try {
      const { data, error } = await supabase
        .from('dashboard_components')
        .insert([{
          type: newNote.type,
          content: newNote.content,
          position_x: newNote.position.x,
          position_y: newNote.position.y,
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
      }
    } catch (error) {
      console.error('Error adding note:', error);
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

  return (
    <div className="w-full h-full relative bg-gray-50 board">
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