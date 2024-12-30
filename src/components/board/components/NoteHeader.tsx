import { Button } from "@/components/ui/button";
import { Minimize2, Maximize2, Save, Trash2 } from "lucide-react";

type NoteHeaderProps = {
  type: string;
  isExpanded: boolean;
  isSaving: boolean;
  onSave: () => void;
  onDelete: () => void;
  onToggleExpand: () => void;
};

export function NoteHeader({
  type,
  isExpanded,
  isSaving,
  onSave,
  onDelete,
  onToggleExpand
}: NoteHeaderProps) {
  return (
    <div className="flex justify-between mb-2">
      <div className="text-sm text-gray-500 capitalize">{type.replace("-", " ")}</div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onSave}
          disabled={isSaving}
        >
          <Save className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onToggleExpand}
        >
          {isExpanded ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}