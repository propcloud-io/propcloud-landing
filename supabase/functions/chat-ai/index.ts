
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

    let relevantProperties: Property[] = [];
    let searchMethod = "fallback";

    // Try vector search first, but fallback to regular query if it fails
    try {
      console.log("Attempting vector search...");
      const queryEmbedding = await generateQueryEmbedding(message);
      relevantProperties = await findRelevantPropertiesVector(supabase, queryEmbedding);
      
      if (relevantProperties && relevantProperties.length > 0) {
        searchMethod = "vector";
        console.log(`Vector search successful: found ${relevantProperties.length} properties`);
      } else {
        console.log("Vector search returned no results, falling back to regular query");
        throw new Error("No vector results found");
      }
    } catch (vectorError) {
      console.log("Vector search failed, using fallback method:", vectorError.message);
      
      // Fallback to regular property query - get ALL properties with basic info
      try {
        console.log("Executing fallback property query...");
        const { data: fallbackProperties, error: fallbackError } = await supabase
          .from("properties")
          .select("*")
          .limit(5);
        
        if (fallbackError) {
          console.error("Fallback query failed:", fallbackError);
          throw fallbackError;
        }
        
        relevantProperties = fallbackProperties || [];
        console.log(`Fallback search found ${relevantProperties.length} properties`);
        
        // Log property details for debugging
        if (relevantProperties.length > 0) {
          console.log("Sample property data:", {
            address: relevantProperties[0].address,
            price: relevantProperties[0].listing_price,
            beds: relevantProperties[0].beds,
            baths: relevantProperties[0].baths,
            hasDescription: !!relevantProperties[0].description
          });
        }
      } catch (fallbackError) {
        console.error("Both vector and fallback searches failed:", fallbackError);
        return new Response(
          JSON.stringify({ 
            response: "I'm having trouble accessing the property database right now. Please try again in a moment." 
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // FIXED: Remove overly restrictive validation that was rejecting valid properties
    if (!relevantProperties || relevantProperties.length === 0) {
      console.log("No properties found in database");
      return new Response(
        JSON.stringify({ 
          response: "I don't have any property data available right now. Please try again later or contact support if this issue persists." 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Proceeding with ${relevantProperties.length} properties for Gemini analysis`);

    // Construct the Master Prompt for Gemini
    const masterPrompt = constructMasterPrompt(message, relevantProperties, searchMethod);
    
    // Call Gemini API
    console.log("Calling Gemini API...");
    const geminiResponse = await callGeminiAPI(masterPrompt);
    
    console.log("Gemini response received successfully");

    return new Response(
      JSON.stringify({ response: geminiResponse }),
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
    const huggingFaceApiKey = Deno.env.get("HUGGING_FACE_API_KEY");
    
    if (!huggingFaceApiKey) {
      throw new Error("HUGGING_FACE_API_KEY is not set");
    }

    console.log("Generating embedding for query:", query);
    
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
          inputs: query,
          options: { wait_for_model: true }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Hugging Face API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Hugging Face API failed: ${response.status} - ${errorText}`);
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
      throw error;
    }

    console.log(`Vector search returned ${properties?.length || 0} properties`);
    return properties || [];
    
  } catch (error) {
    console.error("Error in findRelevantPropertiesVector:", error);
    throw error;
  }
}

function constructMasterPrompt(userQuery: string, properties: Property[], searchMethod: string): string {
  // Create structured context from properties
  const propertyContext = properties.map((prop, index) => {
    return `
**Property ${index + 1}: ${prop.address}**
- Listing Price: $${prop.listing_price?.toLocaleString() || 'N/A'}
- Specifications: ${prop.beds || 'N/A'} beds, ${prop.baths || 'N/A'} baths, ${prop.sqft || 'N/A'} sqft
- Description: ${prop.description || 'No description available'}
- Sales History: ${JSON.stringify(prop.sales_history || 'No data')}
- Tax History: ${JSON.stringify(prop.tax_history || 'No data')}
- Permit History: ${JSON.stringify(prop.permit_history || 'No data')}
- Market Comparables: ${JSON.stringify(prop.market_comps || 'No data')}
- Listing URL: ${prop.listing_url || 'N/A'}
`;
  }).join('\n---\n');

  const searchNote = searchMethod === "vector" 
    ? "Note: These properties were selected using AI-powered semantic search based on your query."
    : "Note: These are sample properties from our database. For more targeted results, try generating AI embeddings first.";

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

${searchNote}

**USER QUESTION:** ${userQuery}

**ANALYSIS:**`;
}

async function callGeminiAPI(prompt: string): Promise<string> {
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
  
  console.log('=== GEMINI API DEBUG START ===');
  console.log('API Key exists:', !!GEMINI_API_KEY);
  console.log('API Key length:', GEMINI_API_KEY?.length || 0);
  console.log('API Key prefix:', GEMINI_API_KEY?.substring(0, 10) + '...' || 'NOT_FOUND');
  
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY environment variable is not set');
    throw new Error('Gemini API key not configured');
  }

  const requestBody = {
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
  };

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  console.log('Request URL:', apiUrl.replace(GEMINI_API_KEY, 'HIDDEN_KEY'));
  console.log('Request body structure:', JSON.stringify(requestBody, null, 2).substring(0, 500) + '...');
  console.log('Prompt length:', prompt.length);

  try {
    console.log('Making Gemini API request...');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Raw response text length:', responseText.length);
    console.log('Raw response preview:', responseText.substring(0, 500));

    if (!response.ok) {
      console.error('Gemini API HTTP error:', response.status, response.statusText);
      console.error('Error response body:', responseText);
      throw new Error(`Gemini API HTTP error: ${response.status} - ${responseText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Parsed response structure:', Object.keys(data));
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Response text:', responseText);
      throw new Error(`Invalid JSON response from Gemini API: ${parseError.message}`);
    }
    
    console.log('Response data candidates:', data.candidates?.length || 0);
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error('No candidates in Gemini response:', JSON.stringify(data, null, 2));
      throw new Error('No response generated by Gemini - check safety filters or prompt content');
    }

    const candidate = data.candidates[0];
    console.log('First candidate structure:', Object.keys(candidate));
    console.log('Content structure:', Object.keys(candidate.content || {}));
    console.log('Parts length:', candidate.content?.parts?.length || 0);

    const generatedText = candidate.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      console.error('No text in candidate parts:', JSON.stringify(candidate, null, 2));
      throw new Error('Empty response text from Gemini');
    }

    console.log('Generated text length:', generatedText.length);
    console.log('Generated text preview:', generatedText.substring(0, 200) + '...');
    console.log('=== GEMINI API DEBUG END ===');

    return generatedText;
    
  } catch (error) {
    console.error('=== GEMINI API ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('=== GEMINI API ERROR END ===');
    throw new Error(`Failed to get AI response: ${error.message}`);
  }
}

serve(handler);
