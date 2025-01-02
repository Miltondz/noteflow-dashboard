import { useState, useEffect } from "react";
import { NoteData } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useBoardQueries } from "./useBoardQueries";
import { transformDbToNote } from "../utils/boardTransformers";

export const useBoardState = (
  onNotesChange?: (notes: NoteData[]) => void,
  onCleanDashboardInit?: (fn: () => void) => void,
) => {
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [dashboardId, setDashboardId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const {
    components,
    updatePositionMutation,
    updateContentMutation,
    deleteComponentMutation,
    cleanDashboardMutation,
  } = useBoardQueries(dashboardId);

  useEffect(() => {
    if (components) {
      const formattedComponents = components.map(component => transformDbToNote(component));
      setNotes(formattedComponents);
      onNotesChange?.(formattedComponents);
    }
  }, [components, onNotesChange]);

  useEffect(() => {
    createDefaultDashboard();
  }, []);

  useEffect(() => {
    if (onCleanDashboardInit) {
      onCleanDashboardInit(() => handleCleanDashboard);
    }
  }, [onCleanDashboardInit, dashboardId]);

  const createDefaultDashboard = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a dashboard.",
          variant: "destructive",
        });
        return;
      }

      const { data: existingDashboards, error: fetchError } = await supabase
        .from('dashboards')
        .select('id')
        .limit(1);

      if (fetchError) throw fetchError;

      if (existingDashboards && existingDashboards.length > 0) {
        setDashboardId(existingDashboards[0].id);
        return;
      }

      const { data: newDashboard, error: createError } = await supabase
        .from('dashboards')
        .insert([
          {
            title: 'My Dashboard',
            description: 'My personal dashboard',
            is_public: false,
            owner_id: user.id
          }
        ])
        .select()
        .single();

      if (createError) throw createError;

      if (newDashboard) {
        setDashboardId(newDashboard.id);
      }
    } catch (error) {
      console.error('Error setting up dashboard:', error);
      toast({
        title: "Error",
        description: "Failed to set up dashboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCleanDashboard = () => {
    if (!dashboardId) return;
    cleanDashboardMutation.mutate(dashboardId);
  };

  return {
    notes,
    setNotes,
    dashboardId,
    updatePositionMutation,
    updateContentMutation,
    deleteComponentMutation,
    handleCleanDashboard,
  };
};