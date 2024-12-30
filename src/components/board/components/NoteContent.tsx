import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";

type NoteContentProps = {
  type: "sticky-note" | "document" | "image" | "text";
  content: string;
  onContentChange: (content: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function NoteContent({
  type,
  content,
  onContentChange,
  fileInputRef,
  handleImageUpload
}: NoteContentProps) {
  if (type === "image") {
    return (
      <div 
        className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400"
        onClick={() => fileInputRef.current?.click()}
      >
        {content ? (
          <img src={content} alt="Note" className="w-full h-full object-cover" />
        ) : (
          <>
            <Upload className="w-8 h-8 mb-2" />
            <span>Click to upload image</span>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </>
        )}
      </div>
    );
  }

  return (
    <Textarea
      value={content}
      onChange={(e) => onContentChange(e.target.value)}
      className={cn(
        "w-full h-full resize-none border-none focus-visible:ring-0 p-0",
        type === "document" && "font-serif text-base leading-relaxed bg-transparent",
        type === "text" && "text-base leading-relaxed"
      )}
      placeholder={
        type === "sticky-note" 
          ? "Add a note..." 
          : type === "document" 
          ? "Start typing your document..." 
          : "Start typing..."
      }
      style={type === "document" ? { color: "inherit" } : undefined}
    />
  );
}