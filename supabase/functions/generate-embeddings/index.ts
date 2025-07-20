
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Property {
  id: string;
  address: string;
  description: string;
  beds: number;
  baths: number;
  sqft: number;
  listing_price: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Starting embedding generation for all properties...");

    // Get all properties that need embeddings
    const { data: properties, error: fetchError } = await supabase
      .from("properties")
      .select("id, address, description, beds, baths, sqft, listing_price")
      .is('embedding', null);

    if (fetchError) {
      console.error("Error fetching properties:", fetchError);
      throw fetchError;
    }

    if (!properties || properties.length === 0) {
      return new Response(
        JSON.stringify({ message: "No properties need embeddings" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${properties.length} properties needing embeddings`);

    // Process each property
    let successCount = 0;
    let errorCount = 0;

    for (const property of properties) {
      try {
        console.log(`Processing property: ${property.address}`);
        
        // Create text representation of property for embedding
        const propertyText = createPropertyText(property);
        
        // Generate embedding using Hugging Face transformers
        const embedding = await generateEmbedding(propertyText);
        
        // Update property with embedding
        const { error: updateError } = await supabase
          .from("properties")
          .update({ embedding })
          .eq("id", property.id);

        if (updateError) {
          console.error(`Error updating property ${property.id}:`, updateError);
          errorCount++;
        } else {
          console.log(`Successfully updated embedding for: ${property.address}`);
          successCount++;
        }
      } catch (error) {
        console.error(`Error processing property ${property.id}:`, error);
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Embedding generation complete. Success: ${successCount}, Errors: ${errorCount}`,
        successCount,
        errorCount
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in generate-embeddings function:", error);
    return new Response(
      JSON.stringify({ error: `Embedding generation failed: ${error.message}` }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
};

function createPropertyText(property: Property): string {
  // Create a comprehensive text representation for embedding
  const parts = [
    `Property at ${property.address}`,
    property.description || '',
    `${property.beds} bedrooms, ${property.baths} bathrooms`,
    `${property.sqft || 'unknown'} square feet`,
    `Listed at $${property.listing_price?.toLocaleString() || 'N/A'}`
  ];
  
  return parts.filter(part => part.trim()).join('. ');
}

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Use Hugging Face Inference API for sentence transformers
    const response = await fetch(
      "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: text,
          options: { wait_for_model: true }
        }),
      }
    );

    if (!response.ok) {
      console.error(`Hugging Face API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`Hugging Face API failed: ${response.status}`);
    }

    const embedding = await response.json();
    
    // The API returns the embedding directly as an array
    if (Array.isArray(embedding) && embedding.length > 0) {
      return embedding;
    } else {
      throw new Error("Invalid embedding format received");
    }
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

serve(handler);
