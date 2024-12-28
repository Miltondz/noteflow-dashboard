export interface Position {
  x: number;
  y: number;
}

export interface NoteData {
  id: string;
  type: "sticky-note" | "document" | "image" | "text";
  content: string;
  position: Position;
  isExpanded?: boolean;
  style?: Record<string, string>;
}