
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
    // Use SERVICE_ROLE_KEY to bypass RLS and access all properties
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Starting embedding generation for all properties...");

    // Get all properties that need embeddings (where embedding IS NULL)
    const { data: properties, error: fetchError } = await supabase
      .from("properties")
      .select("id, address, description, beds, baths, sqft, listing_price")
      .is('embedding', null);

    if (fetchError) {
      console.error("Error fetching properties:", fetchError);
      throw fetchError;
    }

    if (!properties || properties.length === 0) {
      console.log("No properties found that need embeddings");
      return new Response(
        JSON.stringify({ 
          message: "No properties need embeddings. All properties already have embeddings generated.", 
          successCount: 0, 
          errorCount: 0 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${properties.length} properties needing embeddings`);

    // Enhanced Hugging Face API test with detailed error reporting
    const testResult = await testHuggingFaceAPIDetailed();
    if (!testResult.success) {
      console.error("Hugging Face API test failed:", testResult.error);
      return new Response(
        JSON.stringify({ 
          error: `Hugging Face API test failed: ${testResult.error}. Please check your API key permissions for Inference API access.`,
          successCount: 0,
          errorCount: 0,
          details: testResult.details
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Hugging Face API test passed, proceeding with embedding generation...");

    // Process each property with enhanced error handling
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const property of properties) {
      try {
        console.log(`Processing property: ${property.address}`);
        
        // Create text representation of property for embedding
        const propertyText = createPropertyText(property);
        console.log(`Property text created (${propertyText.length} chars): ${propertyText.substring(0, 100)}...`);
        
        // Generate embedding using Hugging Face transformers with enhanced retry
        const embedding = await generateEmbeddingWithEnhancedRetry(propertyText, 3);
        
        // Update property with embedding - use service role key to bypass RLS
        const { error: updateError } = await supabase
          .from("properties")
          .update({ embedding })
          .eq("id", property.id);

        if (updateError) {
          console.error(`Error updating property ${property.id}:`, updateError);
          errors.push(`Failed to update ${property.address}: ${updateError.message}`);
          errorCount++;
        } else {
          console.log(`Successfully updated embedding for: ${property.address}`);
          successCount++;
        }
      } catch (error) {
        console.error(`Error processing property ${property.id}:`, error);
        errors.push(`Failed to process ${property.address}: ${error.message}`);
        errorCount++;
      }

      // Add a small delay between requests to avoid rate limiting
      if (properties.indexOf(property) < properties.length - 1) {
        console.log("Waiting 2 seconds before next request...");
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    const response = {
      message: `Embedding generation complete. Success: ${successCount}, Errors: ${errorCount}`,
      successCount,
      errorCount,
      errors: errorCount > 0 ? errors : undefined
    };

    return new Response(
      JSON.stringify(response),
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

async function testHuggingFaceAPIDetailed(): Promise<{ success: boolean; error?: string; details?: any }> {
  try {
    const huggingFaceApiKey = Deno.env.get("HUGGING_FACE_API_KEY");
    
    if (!huggingFaceApiKey) {
      return { success: false, error: "HUGGING_FACE_API_KEY is not set" };
    }

    console.log("Testing Hugging Face API access with detailed logging...");
    console.log("API Key length:", huggingFaceApiKey.length);
    console.log("API Key prefix:", huggingFaceApiKey.substring(0, 10) + "...");
    
    const response = await fetch(
      "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${huggingFaceApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: "test embedding generation",
          options: { wait_for_model: true }
        }),
      }
    );

    console.log("API Response status:", response.status);
    console.log("API Response headers:", Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log("API Response text preview:", responseText.substring(0, 500));

    if (!response.ok) {
      console.error(`Hugging Face API test failed: ${response.status} ${response.statusText}`);
      console.error("Error response body:", responseText);
      
      let errorDetails;
      try {
        errorDetails = JSON.parse(responseText);
      } catch {
        errorDetails = { raw_response: responseText };
      }
      
      return { 
        success: false, 
        error: `HTTP ${response.status}: ${response.statusText}`,
        details: errorDetails
      };
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      return { 
        success: false, 
        error: "Invalid JSON response from Hugging Face API",
        details: { raw_response: responseText, parse_error: parseError.message }
      };
    }

    if (!Array.isArray(result) || result.length === 0) {
      return { 
        success: false, 
        error: "Invalid response format from Hugging Face API",
        details: { response_type: typeof result, response_preview: JSON.stringify(result).substring(0, 200) }
      };
    }

    console.log("Hugging Face API test successful - embedding dimensions:", result.length);
    return { success: true };
    
  } catch (error) {
    console.error("Hugging Face API test error:", error);
    return { 
      success: false, 
      error: error.message,
      details: { error_type: error.constructor.name, stack: error.stack }
    };
  }
}

function createPropertyText(property: Property): string {
  // Create a comprehensive text representation for embedding
  const parts = [
    `Property at ${property.address}`,
    property.description || 'No description available',
    `${property.beds || 0} bedrooms, ${property.baths || 0} bathrooms`,
    `${property.sqft || 'unknown'} square feet`,
    `Listed at $${property.listing_price?.toLocaleString() || 'N/A'}`
  ];
  
  return parts.filter(part => part.trim()).join('. ');
}

async function generateEmbeddingWithEnhancedRetry(text: string, maxRetries: number): Promise<number[]> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Embedding attempt ${attempt}/${maxRetries} for text: ${text.substring(0, 50)}...`);
      
      // Add extra delay for first attempt to allow model to load
      if (attempt === 1) {
        console.log("First attempt - waiting 10 seconds for model to load...");
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
      
      return await generateEmbedding(text);
    } catch (error) {
      console.error(`Embedding attempt ${attempt} failed:`, error);
      lastError = error;
      
      if (attempt < maxRetries) {
        // Exponential backoff with longer delays
        const delay = Math.pow(2, attempt) * 2000; // 4s, 8s, 16s...
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const huggingFaceApiKey = Deno.env.get("HUGGING_FACE_API_KEY");
    
    if (!huggingFaceApiKey) {
      throw new Error("HUGGING_FACE_API_KEY is not set");
    }

    console.log("Calling Hugging Face API for embedding...");
    console.log("Text length:", text.length);
    
    // Use Hugging Face Inference API for sentence transformers
    const response = await fetch(
      "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${huggingFaceApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: text,
          options: { wait_for_model: true }
        }),
      }
    );

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Hugging Face API error: ${response.status} ${response.statusText}`);
      console.error("Error response body:", errorText);
      
      // Parse error details if available
      let errorDetails;
      try {
        errorDetails = JSON.parse(errorText);
        console.error("Parsed error details:", errorDetails);
      } catch {
        console.error("Could not parse error response as JSON");
      }
      
      throw new Error(`Hugging Face API failed: ${response.status} - ${errorText}`);
    }

    const responseText = await response.text();
    console.log("Response text length:", responseText.length);
    console.log("Response text preview:", responseText.substring(0, 200));

    let embedding;
    try {
      embedding = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse embedding response as JSON:", parseError);
      console.error("Raw response:", responseText);
      throw new Error("Invalid JSON response from Hugging Face API");
    }
    
    console.log(`Embedding response type: ${typeof embedding}, is array: ${Array.isArray(embedding)}`);
    
    // The API returns the embedding directly as an array
    if (Array.isArray(embedding) && embedding.length > 0) {
      console.log(`Successfully generated embedding with ${embedding.length} dimensions`);
      console.log("First few dimensions:", embedding.slice(0, 5));
      return embedding;
    } else {
      console.error("Invalid embedding format received:", {
        type: typeof embedding,
        isArray: Array.isArray(embedding),
        length: embedding?.length,
        preview: JSON.stringify(embedding).substring(0, 200)
      });
      throw new Error("Invalid embedding format received from Hugging Face API");
    }
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

serve(handler);
