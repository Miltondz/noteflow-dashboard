import { Button } from "@/components/ui/button";
import { Sidebar as ShadcnSidebar, SidebarContent } from "@/components/ui/sidebar";
import { StickyNote, Image, FileText } from "lucide-react";

interface Tool {
  icon: typeof StickyNote;
  label: string;
  type: "sticky-note" | "document" | "image";
}

export function Sidebar({ onAddNote }: { onAddNote: (type: Tool["type"], position?: { x: number; y: number }) => void }) {
  const tools: Tool[] = [
    { icon: StickyNote, label: "Sticky Note", type: "sticky-note" },
    { icon: FileText, label: "Document", type: "document" },
    { icon: Image, label: "Image", type: "image" },
  ];

  const handleDragStart = (e: React.DragEvent, type: Tool["type"]) => {
    e.dataTransfer.setData("application/lovable-type", type);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <ShadcnSidebar>
      <SidebarContent>
        <div className="p-4 space-y-4">
          {tools.map((tool) => (
            <Button
              key={tool.type}
              variant="ghost"
              className="w-full justify-start gap-2 hover:bg-primary/10 cursor-grab active:cursor-grabbing"
              draggable
              onDragStart={(e) => handleDragStart(e, tool.type)}
              onClick={() => onAddNote(tool.type)}
            >
              <tool.icon className="h-5 w-5" />
              <span>{tool.label}</span>
            </Button>
          ))}
        </div>
      </SidebarContent>
    </ShadcnSidebar>
  );
}