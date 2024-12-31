import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { downloadDashboard } from "../utils/downloadUtils";
import { NoteData } from "../types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BoardActionsProps {
  notes: NoteData[];
  onCleanDashboard: () => void;
}

export function BoardActions({ notes, onCleanDashboard }: BoardActionsProps) {
  return (
    <div className="absolute top-4 right-4 z-10 flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => downloadDashboard(notes)}
        className="bg-background border shadow-sm hover:bg-accent"
      >
        <Download className="h-4 w-4 mr-2" />
        Download
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Clean Dashboard
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all components
              from your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onCleanDashboard}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}