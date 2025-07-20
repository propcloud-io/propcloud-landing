
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

    // Step 1: Generate query embedding using a simple approach
    // For now, we'll get relevant properties based on keyword matching and content
    // In production, you'd use a proper embedding model here
    const queryEmbedding = await generateQueryEmbedding(message);
    
    // Step 2: Perform semantic search on properties
    const relevantProperties = await findRelevantProperties(supabase, message, queryEmbedding);
    
    if (!relevantProperties || relevantProperties.length === 0) {
      console.log("No relevant properties found");
      return new Response(
        JSON.stringify({ 
          message: "I don't have enough relevant property data to answer your question confidently. Could you ask about a specific property or provide more details about what you're looking for?" 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${relevantProperties.length} relevant properties`);

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
  // Simplified approach - in production you'd use a proper embedding model
  // For now, we'll return a simple representation
  const words = query.toLowerCase().split(' ');
  const embedding = new Array(384).fill(0);
  
  // Simple hash-based embedding for demonstration
  words.forEach((word, index) => {
    const hash = simpleHash(word);
    embedding[hash % 384] += 1;
  });
  
  return embedding;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

async function findRelevantProperties(supabase: any, query: string, embedding: number[]): Promise<Property[]> {
  try {
    // For now, we'll use text-based search combined with the most complete properties
    // This is a simplified approach while we build out the full vector search
    
    const queryLower = query.toLowerCase();
    const searchTerms = [
      'ocean drive', 'collins', 'brickell', 'wynwood', 'coral gables',
      'roi', 'return', 'investment', 'cash flow', 'market', 'price',
      'bed', 'bath', 'sqft', 'square feet'
    ];
    
    // Find properties that match search terms or get top properties with complete data
    const { data: properties, error } = await supabase
      .from("properties")
      .select("*")
      .not('market_comps', 'is', null)
      .not('listing_price', 'is', null)
      .limit(5);

    if (error) {
      console.error("Error fetching properties:", error);
      return [];
    }

    if (!properties || properties.length === 0) {
      return [];
    }

    // Score properties based on relevance to query
    const scoredProperties = properties.map((prop: Property) => {
      let score = 0;
      const propText = `${prop.address} ${prop.description || ''}`.toLowerCase();
      
      // Check for direct matches
      searchTerms.forEach(term => {
        if (queryLower.includes(term) && propText.includes(term)) {
          score += 2;
        }
      });
      
      // Boost properties with more complete data
      if (prop.market_comps && prop.sales_history) score += 1;
      if (prop.tax_history && prop.permit_history) score += 1;
      
      return { ...prop, relevanceScore: score };
    });

    // Sort by relevance score and return top 3
    return scoredProperties
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 3);
      
  } catch (error) {
    console.error("Error in findRelevantProperties:", error);
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
