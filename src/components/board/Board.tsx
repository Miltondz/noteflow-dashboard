import { useState } from "react";
import { Note } from "./Note";
import { Textarea } from "@/components/ui/textarea";

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

  const handleAddNote = (type: NoteData["type"]) => {
    const newNote: NoteData = {
      id: crypto.randomUUID(),
      type,
      content: type === "sticky-note" 
        ? "New note" 
        : type === "document" 
        ? "Start typing..." 
        : "Click to add image",
      position: { x: Math.random() * 300, y: Math.random() * 300 },
      isExpanded: true,
    };
    setNotes((prev) => [...prev, newNote]);
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
    <div className="w-full h-full relative bg-gray-50">
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