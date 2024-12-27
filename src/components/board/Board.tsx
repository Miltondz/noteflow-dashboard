import { useState } from "react";
import { Note } from "./Note";

interface NoteData {
  id: string;
  content: string;
  position: { x: number; y: number };
}

export function Board() {
  const [notes, setNotes] = useState<NoteData[]>([
    { id: "1", content: "Welcome to your board!", position: { x: 100, y: 100 } },
  ]);

  const handleNoteMove = (id: string, newPosition: { x: number; y: number }) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, position: newPosition } : note
      )
    );
  };

  return (
    <div className="w-full h-full relative bg-gray-50">
      {notes.map((note) => (
        <Note
          key={note.id}
          id={note.id}
          content={note.content}
          position={note.position}
          onMove={handleNoteMove}
        />
      ))}
    </div>
  );
}