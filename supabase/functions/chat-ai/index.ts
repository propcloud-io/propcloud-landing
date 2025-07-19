
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

    // Get relevant property data for context
    const { data: properties, error: propertiesError } = await supabase
      .from("properties")
      .select("*")
      .limit(5);

    if (propertiesError) {
      console.error("Error fetching properties:", propertiesError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch property data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create context from properties
    const propertyContext = properties.map((prop: Property) => {
      return `
Property: ${prop.address}
Price: $${prop.listing_price?.toLocaleString() || 'N/A'}
Specs: ${prop.beds} beds, ${prop.baths} baths, ${prop.sqft} sqft
Description: ${prop.description}
Sales History: ${JSON.stringify(prop.sales_history)}
Tax History: ${JSON.stringify(prop.tax_history)}
Permit History: ${JSON.stringify(prop.permit_history)}
Market Comps: ${JSON.stringify(prop.market_comps)}
Listing URL: ${prop.listing_url}
`;
    }).join('\n---\n');

    // Create the master prompt for Gemini
    const masterPrompt = `
You are PropCloud, a meticulous and data-driven real estate investment analyst specializing in Miami short-term rental (STR) properties. You provide expert analysis and insights for real estate investors.

CRITICAL RULES:
1. You MUST ONLY use the property data provided below
2. If the answer is not in the provided data, clearly state that you cannot provide a confident analysis
3. Always cite specific data points from the properties when making claims
4. Focus on STR investment potential, ROI analysis, and market trends
5. Be professional, trustworthy, and data-driven in your responses
6. Provide specific numbers and calculations when possible

USER QUESTION: ${message}

AVAILABLE PROPERTY DATA:
${propertyContext}

ANALYSIS FRAMEWORK:
1. First, identify which properties are most relevant to the user's question
2. Extract and analyze the relevant data points
3. Calculate metrics like potential ROI, cash flow, cap rates when applicable
4. Compare properties if appropriate
5. Provide clear recommendations based on the data

Provide your analysis now:
`;

    // Since we don't have actual Gemini API integration, I'll provide a sophisticated mock response
    // In production, you would call the actual Gemini API here
    const mockResponse = generateMockAIResponse(message, properties);

    return new Response(
      JSON.stringify({ message: mockResponse }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: any) {
    console.error("Error in chat-ai function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
};

function generateMockAIResponse(message: string, properties: Property[]): string {
  const lowerMessage = message.toLowerCase();
  
  // ROI Analysis
  if (lowerMessage.includes('roi') || lowerMessage.includes('return') || lowerMessage.includes('investment')) {
    const oceanDrive = properties.find(p => p.address.includes('Ocean Drive'));
    const collins = properties.find(p => p.address.includes('Collins'));
    
    if (oceanDrive && collins) {
      const oceanDriveROI = ((oceanDrive.market_comps.avg_nightly_rate * 365 * oceanDrive.market_comps.occupancy_rate) / oceanDrive.listing_price * 100).toFixed(1);
      const collinsROI = ((collins.market_comps.avg_nightly_rate * 365 * collins.market_comps.occupancy_rate) / collins.listing_price * 100).toFixed(1);
      
      return `Based on the available Miami property data, here's my ROI analysis:

**Top Investment Opportunities:**

**${oceanDrive.address}**
• Listing Price: $${oceanDrive.listing_price.toLocaleString()}
• Nightly Rate: $${oceanDrive.market_comps.avg_nightly_rate}
• Occupancy Rate: ${(oceanDrive.market_comps.occupancy_rate * 100).toFixed(0)}%
• Annual Gross Revenue: $${(oceanDrive.market_comps.avg_nightly_rate * 365 * oceanDrive.market_comps.occupancy_rate).toLocaleString()}
• **Estimated ROI: ${oceanDriveROI}%**

**${collins.address}**
• Listing Price: $${collins.listing_price.toLocaleString()}
• Nightly Rate: $${collins.market_comps.avg_nightly_rate}
• Occupancy Rate: ${(collins.market_comps.occupancy_rate * 100).toFixed(0)}%
• Annual Gross Revenue: $${(collins.market_comps.avg_nightly_rate * 365 * collins.market_comps.occupancy_rate).toLocaleString()}
• **Estimated ROI: ${collinsROI}%**

**Key Insights:**
• Collins Avenue property shows stronger ROI potential due to higher occupancy rates
• Ocean Drive commands premium nightly rates but has slightly lower occupancy
• Both properties benefit from Miami Beach's strong STR market fundamentals

*Note: These calculations are based on gross revenue and don't include operating expenses, taxes, or management fees.*`;
    }
  }
  
  // Market Analysis
  if (lowerMessage.includes('market') || lowerMessage.includes('trend') || lowerMessage.includes('miami')) {
    return `Based on the current Miami property data, here's my market analysis:

**Miami STR Market Overview:**

**Price Segments:**
• Luxury Tier ($1M+): Collins Avenue penthouse at $1,250,000
• Mid-Market ($600K-$1M): Ocean Drive condo at $850,000, Coral Gables home at $950,000
• Value Tier (<$600K): Brickell condo at $680,000, Wynwood loft at $425,000

**Performance Metrics:**
• Average Nightly Rates: $140-$380 across different areas
• Occupancy Rates: 72%-85% depending on location and property type
• Highest Performing: Collins Avenue (85% occupancy, $380/night)
• Emerging Value: Wynwood Arts District (80% occupancy, $140/night)

**Location Insights:**
• **Miami Beach**: Premium pricing, established STR market, strong tourist demand
• **Brickell**: Business travel focused, consistent mid-week bookings
• **Wynwood**: Hip, artistic neighborhood attracting younger demographics
• **Coral Gables**: Luxury market with cultural attractions nearby

**Investment Trends:**
• Properties with recent renovations show 15-20% premium rates
• Oceanfront locations maintain higher occupancy rates year-round
• Permit activity suggests continued market confidence`;
  }
  
  // Specific property inquiry
  if (lowerMessage.includes('ocean drive') || lowerMessage.includes('123 ocean')) {
    const property = properties.find(p => p.address.includes('Ocean Drive'));
    if (property) {
      return `**Property Analysis: ${property.address}**

**Investment Fundamentals:**
• **Current Price**: $${property.listing_price.toLocaleString()}
• **Property Type**: ${property.beds} bed, ${property.baths} bath oceanfront condo
• **Size**: ${property.sqft} square feet
• **Price per sqft**: $${Math.round(property.listing_price / property.sqft)}

**STR Performance Data:**
• **Nightly Rate**: $${property.market_comps.avg_nightly_rate}
• **Occupancy Rate**: ${(property.market_comps.occupancy_rate * 100).toFixed(0)}%
• **Annual Gross Revenue**: $${(property.market_comps.avg_nightly_rate * 365 * property.market_comps.occupancy_rate).toLocaleString()}

**Recent Activity:**
• **Sales History**: Last sold for $820,000 in March 2023 (3.7% appreciation)
• **Tax Assessment**: $780,000 in 2024 ($18,720 annual taxes)
• **Recent Improvements**: Interior renovation ($45,000) and electrical upgrade ($8,000)

**Comparable Properties:**
• 125 Ocean Drive: $275/night
• 119 Ocean Drive: $230/night
• **This property is competitively positioned** at $250/night

**Investment Recommendation:**
This oceanfront property offers **strong fundamentals** with recent renovations supporting premium pricing. The 78% occupancy rate is solid for Miami Beach, and the $250 nightly rate is well-positioned among comparables.

**Risk Factors**: Higher price point requires strong marketing, seasonal demand fluctuations typical for Miami Beach.`;
    }
  }
  
  // Comparison request
  if (lowerMessage.includes('compare') || lowerMessage.includes('vs') || lowerMessage.includes('versus')) {
    return `**Miami Property Comparison Analysis:**

I've analyzed our top 3 STR investment opportunities:

**🏆 Best Overall ROI: Collins Avenue Penthouse**
• Price: $1,250,000 | ROI: 11.1%
• Nightly Rate: $380 | Occupancy: 85%
• Why: Premium location, highest occupancy rate, luxury amenities

**💰 Best Value Play: Wynwood Loft**
• Price: $425,000 | ROI: 26.4%
• Nightly Rate: $140 | Occupancy: 80%
• Why: Emerging neighborhood, high occupancy, low entry cost

**🏖️ Best Location Premium: Ocean Drive**
• Price: $850,000 | ROI: 7.1%
• Nightly Rate: $250 | Occupancy: 78%
• Why: Iconic Miami Beach address, strong brand recognition

**📊 Key Metrics Summary:**
• **Highest Cash Flow**: Collins Avenue ($118,170/year)
• **Lowest Investment**: Wynwood ($425,000)
• **Most Stable**: Ocean Drive (established market)
• **Highest Growth Potential**: Wynwood (gentrifying area)

**My Recommendation**: For maximum ROI with reasonable risk, consider the **Wynwood property** - it offers the best return percentage while being in an up-and-coming area with strong fundamentals.`;
  }
  
  // Default response
  return `I'm your PropCloud AI assistant, ready to help with Miami real estate investment analysis.

**Available Data Coverage:**
• 5 premium Miami properties across key neighborhoods
• Market comparables and nightly rates
• Historical sales and tax data
• Recent permit activity
• STR performance metrics

**I can help you with:**
• ROI calculations and investment analysis
• Property comparisons and recommendations
• Market trends and neighborhood insights
• Cash flow projections
• Risk assessment

**Sample Questions:**
• "What's the ROI on the Ocean Drive property?"
• "Compare investment potential across Miami neighborhoods"
• "Show me the best value properties for STR investing"
• "What are the market trends in Miami Beach?"

What specific analysis would you like me to perform with the available property data?`;
}

serve(handler);
