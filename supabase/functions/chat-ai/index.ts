
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChatRequest {
  message: string;
  conversation_id: string;
}

interface Property {
  id: string;
  address: string;
  listing_price: number;
  beds: number;
  baths: number;
  sqft: number;
  description: string;
  sales_history: any;
  tax_history: any;
  permit_history: any;
  market_comps: any;
  listing_url: string;
  image_url: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { message, conversation_id }: ChatRequest = await req.json();

    console.log("Processing user query:", message);

    // Step 1: Generate query embedding using Hugging Face transformers
    const queryEmbedding = await generateQueryEmbedding(message);
    
    // Step 2: Perform semantic vector search on properties
    const relevantProperties = await findRelevantPropertiesVector(supabase, queryEmbedding);
    
    if (!relevantProperties || relevantProperties.length === 0) {
      console.log("No relevant properties found with vector search");
      return new Response(
        JSON.stringify({ 
          message: "I don't have enough relevant property data to answer your question confidently. Could you ask about a specific property or provide more details about what you're looking for?" 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${relevantProperties.length} relevant properties using vector search`);

    // Step 3: Construct the Master Prompt for Gemini
    const masterPrompt = constructMasterPrompt(message, relevantProperties);
    
    // Step 4: Call Gemini API
    const geminiResponse = await callGeminiAPI(masterPrompt);
    
    console.log("Gemini response received");

    return new Response(
      JSON.stringify({ message: geminiResponse }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: any) {
    console.error("Error in chat-ai function:", error);
    return new Response(
      JSON.stringify({ error: `AI processing failed: ${error.message}` }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
};

async function generateQueryEmbedding(query: string): Promise<number[]> {
  try {
    console.log("Generating embedding for query:", query);
    
    // Use Hugging Face Inference API for sentence transformers
    const response = await fetch(
      "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: query,
          options: { wait_for_model: true }
        }),
      }
    );

    if (!response.ok) {
      console.error(`Hugging Face API error: ${response.status} ${response.statusText}`);
      throw new Error(`Hugging Face API failed: ${response.status}`);
    }

    const embedding = await response.json();
    
    // The API returns the embedding directly as an array
    if (Array.isArray(embedding) && embedding.length > 0) {
      console.log("Successfully generated query embedding");
      return embedding;
    } else {
      throw new Error("Invalid embedding format received");
    }
  } catch (error) {
    console.error("Error generating query embedding:", error);
    throw error;
  }
}

async function findRelevantPropertiesVector(supabase: any, queryEmbedding: number[]): Promise<Property[]> {
  try {
    console.log("Performing vector similarity search...");
    
    // Use pgvector cosine similarity search
    const { data: properties, error } = await supabase
      .rpc('match_properties', {
        query_embedding: queryEmbedding,
        match_threshold: 0.3,
        match_count: 3
      });

    if (error) {
      console.error("Error in vector search:", error);
      // Fallback to regular query if vector search fails
      console.log("Falling back to regular property query...");
      const { data: fallbackProperties, error: fallbackError } = await supabase
        .from("properties")
        .select("*")
        .not('embedding', 'is', null)
        .limit(3);
      
      if (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
        return [];
      }
      
      return fallbackProperties || [];
    }

    console.log(`Vector search returned ${properties?.length || 0} properties`);
    return properties || [];
    
  } catch (error) {
    console.error("Error in findRelevantPropertiesVector:", error);
    return [];
  }
}

function constructMasterPrompt(userQuery: string, properties: Property[]): string {
  // Create structured context from properties
  const propertyContext = properties.map((prop, index) => {
    return `
**Property ${index + 1}: ${prop.address}**
- Listing Price: $${prop.listing_price?.toLocaleString() || 'N/A'}
- Specifications: ${prop.beds} beds, ${prop.baths} baths, ${prop.sqft || 'N/A'} sqft
- Description: ${prop.description || 'No description available'}
- Sales History: ${JSON.stringify(prop.sales_history || {})}
- Tax History: ${JSON.stringify(prop.tax_history || {})}
- Permit History: ${JSON.stringify(prop.permit_history || {})}
- Market Comparables: ${JSON.stringify(prop.market_comps || {})}
- Listing URL: ${prop.listing_url || 'N/A'}
`;
  }).join('\n---\n');

  return `You are PropCloud, a meticulous and data-driven Miami real estate investment analyst specializing in short-term rental (STR) properties. Your tone is professional, confident, and helpful.

**CRITICAL RULES:**
1. You MUST ONLY use the property data provided in the [CONTEXT] section below
2. You MUST NOT use any general real estate knowledge outside the provided data
3. If the data required to answer the question is not in the context, state that you cannot provide a confident analysis without more information
4. Always cite specific data points from the properties when making claims
5. Focus on STR investment potential, ROI analysis, and market trends
6. Provide specific numbers and calculations when possible
7. Use **bold text** for emphasis and bullet points for lists
8. Be concise but comprehensive in your analysis

**ANALYSIS FRAMEWORK:**
1. First, identify which properties are most relevant to the user's question
2. Extract and analyze the relevant data points
3. Calculate metrics like potential ROI, cash flow, cap rates when applicable using the formula: (Annual Rental Income / Property Price) × 100
4. Compare properties if appropriate
5. Provide clear recommendations based on the data

**[CONTEXT]:**
${propertyContext}

**USER QUESTION:** ${userQuery}

**ANALYSIS:**`;
}

async function callGeminiAPI(prompt: string): Promise<string> {
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
  
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error('No candidates in Gemini response:', data);
      throw new Error('No response generated by Gemini');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    
    if (!generatedText) {
      throw new Error('Empty response from Gemini');
    }

    return generatedText;
    
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error(`Failed to get AI response: ${error.message}`);
  }
}

serve(handler);
