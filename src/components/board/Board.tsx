import { Note } from "./Note";
import { NoteData } from "./types";
import { BoardHeader } from "./components/BoardHeader";
import { useBoardState } from "./hooks/useBoardState";
import { useBoardHandlers } from "./hooks/useBoardHandlers";

interface BoardProps {
  onNotesChange?: (notes: NoteData[]) => void;
  onCleanDashboardInit?: (fn: () => void) => void;
}

export function Board({ onNotesChange, onCleanDashboardInit }: BoardProps) {
  const {
    notes,
    setNotes,
    dashboardId,
    updatePositionMutation,
    updateContentMutation,
    deleteComponentMutation,
    handleCleanDashboard,
  } = useBoardState(onNotesChange, onCleanDashboardInit);

  const {
    handleNoteMove,
    handleAddNote,
    handleContentChange,
    handleToggleExpand,
    handleDelete,
  } = useBoardHandlers(
    notes,
    setNotes,
    dashboardId,
    updatePositionMutation,
    updateContentMutation,
    deleteComponentMutation,
    onNotesChange,
  );

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
      x: Math.max(0, e.clientX - boardRect.left),
      y: Math.max(0, e.clientY - boardRect.top),
    };

    // Find the highest z-index among existing notes
    const maxZIndex = notes.reduce((max, note) => {
      const zIndex = note.style?.zIndex ? parseInt(note.style.zIndex) : 0;
      return Math.max(max, zIndex);
    }, 0);

    // Add the new note with a higher z-index
    handleAddNote(type, position, maxZIndex + 1);
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
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}