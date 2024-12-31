import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";
import { DocumentControls } from "./DocumentControls";
import { useState } from "react";

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
  const [fontSize, setFontSize] = useState(14);

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

  if (type === "document") {
    const lines = content.split('\n');
    
    return (
      <div className="relative w-full h-full flex">
        <div className="bg-gray-100 dark:bg-gray-800 p-2 text-sm font-mono text-gray-500 select-none">
          {lines.map((_, i) => (
            <div key={i} className="text-right pr-2">
              {i + 1}
            </div>
          ))}
        </div>
        <Textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className={cn(
            "w-full h-full resize-none border-none focus-visible:ring-0 p-2",
            "font-serif bg-transparent leading-relaxed"
          )}
          placeholder="Start typing your document..."
          style={{ fontSize: `${fontSize}px` }}
        />
        <DocumentControls onFontSizeChange={setFontSize} />
      </div>
    );
  }

  return (
    <Textarea
      value={content}
      onChange={(e) => onContentChange(e.target.value)}
      className={cn(
        "w-full h-full resize-none border-none focus-visible:ring-0 p-0",
        type === "text" && "text-base leading-relaxed"
      )}
      placeholder={
        type === "sticky-note" 
          ? "Add a note..." 
          : "Start typing..."
      }
    />
  );
}