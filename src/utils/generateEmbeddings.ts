
import { supabase } from "@/integrations/supabase/client";

export const generateEmbeddings = async () => {
  try {
    console.log("Calling generate-embeddings function...");
    
    const { data, error } = await supabase.functions.invoke('generate-embeddings', {
      body: {}
    });

    if (error) {
      console.error('Error calling generate-embeddings:', error);
      throw error;
    }

    console.log('Generate embeddings response:', data);
    return data;
  } catch (error) {
    console.error('Failed to generate embeddings:', error);
    throw error;
  }
};
