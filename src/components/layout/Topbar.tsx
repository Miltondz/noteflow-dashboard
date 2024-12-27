import { Button } from "@/components/ui/button";
import { Share2, Settings } from "lucide-react";

export function Topbar() {
  return (
    <div className="h-14 border-b flex items-center justify-between px-4 bg-white">
      <div className="flex items-center gap-4">
        <h1 className="font-semibold">My Board</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}