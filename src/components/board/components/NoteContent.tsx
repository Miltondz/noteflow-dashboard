import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { TodoList } from "./TodoList";

interface NoteContentProps {
  type: string;
  content: string;
  onContentChange: (content: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function NoteContent({
  type,
  content,
  onContentChange,
  fileInputRef,
  handleImageUpload,
}: NoteContentProps) {
  if (type === "image") {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        {content ? (
          <img src={content} alt="Uploaded" className="max-w-full max-h-full object-contain" />
        ) : (
          <>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              ref={fileInputRef}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" /> Upload Image
            </Button>
          </>
        )}
      </div>
    );
  }

  if (type === "todo-list") {
    return (
      <TodoList
        content={content}
        onChange={onContentChange}
      />
    );
  }

  return (
    <Textarea
      value={content}
      onChange={(e) => onContentChange(e.target.value)}
      className="w-full h-full resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0"
      placeholder={type === "document" ? "Start typing your document..." : "Type your note..."}
    />
  );
}