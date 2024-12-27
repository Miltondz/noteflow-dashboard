import { Button } from "@/components/ui/button";
import { Sidebar as ShadcnSidebar, SidebarContent } from "@/components/ui/sidebar";
import { StickyNote, Image, FileText } from "lucide-react";

interface Tool {
  icon: typeof StickyNote;
  label: string;
  type: "sticky-note" | "document" | "image";
}

export function Sidebar({ onAddNote }: { onAddNote: (type: Tool["type"]) => void }) {
  const tools: Tool[] = [
    { icon: StickyNote, label: "Sticky Note", type: "sticky-note" },
    { icon: FileText, label: "Document", type: "document" },
    { icon: Image, label: "Image", type: "image" },
  ];

  return (
    <ShadcnSidebar>
      <SidebarContent>
        <div className="p-4 space-y-4">
          {tools.map((tool) => (
            <Button
              key={tool.type}
              variant="ghost"
              className="w-full justify-start gap-2 hover:bg-primary/10"
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