import { NoteData } from "../types";

export const transformDbToNote = (dbComponent: any): NoteData => ({
  id: dbComponent.id,
  type: dbComponent.type,
  content: dbComponent.content,
  position: { 
    x: typeof dbComponent.position_x === 'number' ? dbComponent.position_x : 0, 
    y: typeof dbComponent.position_y === 'number' ? dbComponent.position_y : 0 
  },
  style: dbComponent.style as Record<string, any>,
  isExpanded: true,
});

export const transformNoteToDb = (note: NoteData) => ({
  position_x: typeof note.position.x === 'number' ? note.position.x : 0,
  position_y: typeof note.position.y === 'number' ? note.position.y : 0,
  content: note.content,
  style: note.style,
});