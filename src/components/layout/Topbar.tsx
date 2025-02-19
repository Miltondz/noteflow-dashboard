import { Button } from "@/components/ui/button";
import { Share2, Settings, LogOut, Moon, Sun, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/use-theme";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { BoardActions } from "@/components/board/components/BoardActions";
import { NoteData } from "@/components/board/types";

interface TopbarProps {
  notes?: NoteData[];
  onCleanDashboard?: () => void;
}

export function Topbar({ notes = [], onCleanDashboard }: TopbarProps) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="h-14 border-b flex items-center justify-between px-4 bg-background">
      <div className="flex items-center gap-2">
        <h1 className="font-semibold">My Board</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Share2 className="h-4 w-4" />
        </Button>
        {notes && onCleanDashboard && (
          <AlertDialog>
            <BoardActions notes={notes} onCleanDashboard={onCleanDashboard} />
          </AlertDialog>
        )}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}