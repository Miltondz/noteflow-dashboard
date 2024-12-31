import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Board } from "@/components/board/Board";
import { useState } from "react";
import { NoteData } from "@/components/board/types";

const Index = () => {
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [cleanDashboardFn, setCleanDashboardFn] = useState<(() => void) | undefined>();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar onAddNote={(type, position) => {
          const board = document.querySelector(".board") as HTMLElement;
          if (board) {
            if (position) {
              const event = new CustomEvent("addNote", { detail: { type, position } });
              board.dispatchEvent(event);
            } else {
              const event = new CustomEvent("addNote", { detail: { type } });
              board.dispatchEvent(event);
            }
          }
        }} />
        <div className="flex-1 flex flex-col">
          <Topbar notes={notes} onCleanDashboard={cleanDashboardFn} />
          <Board 
            onNotesChange={setNotes} 
            onCleanDashboardInit={setCleanDashboardFn}
          />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;