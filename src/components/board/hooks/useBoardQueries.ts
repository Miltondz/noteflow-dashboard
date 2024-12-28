import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NoteData } from "../types";
import { useToast } from "@/components/ui/use-toast";

export const useBoardQueries = (dashboardId: string | null) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: components } = useQuery({
    queryKey: ['dashboard-components', dashboardId],
    queryFn: async () => {
      if (!dashboardId) return [];
      const { data, error } = await supabase
        .from('dashboard_components')
        .select('*')
        .eq('dashboard_id', dashboardId);
      
      if (error) throw error;
      
      return data.map(component => ({
        id: component.id,
        type: component.type,
        content: component.content || '',
        position: { x: component.position_x, y: component.position_y },
        isExpanded: true,
        style: component.style as Record<string, string>,
      }));
    },
    enabled: !!dashboardId,
  });

  const updatePositionMutation = useMutation({
    mutationFn: async ({ id, position }: { id: string, position: { x: number, y: number } }) => {
      const { error } = await supabase
        .from('dashboard_components')
        .update({
          position_x: position.x,
          position_y: position.y,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
  });

  const updateContentMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string, content: string }) => {
      const { error } = await supabase
        .from('dashboard_components')
        .update({
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
  });

  const deleteComponentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('dashboard_components')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-components', dashboardId] });
      toast({
        title: "Success",
        description: "Note deleted successfully!",
      });
    },
  });

  return {
    components,
    updatePositionMutation,
    updateContentMutation,
    deleteComponentMutation,
  };
};