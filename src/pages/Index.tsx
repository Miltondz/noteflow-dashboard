import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Board } from "@/components/board/Board";

const Index = () => {
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
          <Topbar />
          <Board />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;