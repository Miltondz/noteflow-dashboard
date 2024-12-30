import { Button } from "@/components/ui/button";
import { SaveAll } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BoardHeaderProps {
  dashboardId: string | null;
}

export function BoardHeader({ dashboardId }: BoardHeaderProps) {
  const { toast } = useToast();

  const handleSaveAll = async () => {
    if (!dashboardId) {
      toast({
        title: "Error",
        description: "Dashboard not ready. Please try again in a moment.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('dashboard_components')
        .update({ updated_at: new Date().toISOString() })
        .eq('dashboard_id', dashboardId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "All components saved successfully!",
      });
    } catch (error) {
      console.error('Error saving all components:', error);
      toast({
        title: "Error",
        description: "Failed to save all components. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="absolute top-4 right-4 z-10">
      <Button
        variant="outline"
        size="sm"
        onClick={handleSaveAll}
        className="bg-white shadow-sm"
      >
        <SaveAll className="h-4 w-4 mr-2" />
        Save All
      </Button>
    </div>
  );
}