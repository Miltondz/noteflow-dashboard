import { Button } from "@/components/ui/button";
import { Sidebar as ShadcnSidebar, SidebarContent } from "@/components/ui/sidebar";
import { StickyNote, Image, FileText, Plus } from "lucide-react";

export function Sidebar() {
  const tools = [
    { icon: StickyNote, label: "Sticky Note" },
    { icon: FileText, label: "Document" },
    { icon: Image, label: "Image" },
  ];

  return (
    <ShadcnSidebar>
      <SidebarContent>
        <div className="p-4 space-y-4">
          {tools.map((Tool, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start gap-2 hover:bg-primary/10"
            >
              <Tool.icon className="h-5 w-5" />
              <span>{Tool.label}</span>
            </Button>
          ))}
          <Button className="w-full gap-2">
            <Plus className="h-5 w-5" />
            Add Note
          </Button>
        </div>
      </SidebarContent>
    </ShadcnSidebar>
  );
}