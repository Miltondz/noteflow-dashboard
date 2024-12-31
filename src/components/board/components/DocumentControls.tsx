import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

interface DocumentControlsProps {
  onFontSizeChange: (size: number) => void;
}

export function DocumentControls({ onFontSizeChange }: DocumentControlsProps) {
  const [fontSize, setFontSize] = useState(14); // Default size

  const handleIncreaseFontSize = () => {
    const newSize = Math.min(fontSize + 2, 24); // Max size 24px
    setFontSize(newSize);
    onFontSizeChange(newSize);
  };

  const handleDecreaseFontSize = () => {
    const newSize = Math.max(fontSize - 2, 10); // Min size 10px
    setFontSize(newSize);
    onFontSizeChange(newSize);
  };

  return (
    <div className="absolute bottom-8 right-4 flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleDecreaseFontSize}
        className="h-6 w-6 p-0"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleIncreaseFontSize}
        className="h-6 w-6 p-0"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}