
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: WelcomeEmailRequest = await req.json();
    
    console.log("Sending welcome email to:", email);

    const emailResponse = await resend.emails.send({
      from: "PropCloud <noreply@propcloud.com>",
      to: [email],
      subject: "Welcome to PropCloud - You're on the waitlist! 🏠",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2d3748; font-size: 28px; margin-bottom: 10px;">
                <span style="color: #667eea;">PROP</span><span style="color: #2d3748;">CLOUD</span>
              </h1>
              <div style="width: 60px; height: 4px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0 auto; border-radius: 2px;"></div>
            </div>
            
            <div style="margin-bottom: 30px;">
              <p style="color: #4a5568; font-size: 18px; line-height: 1.6; margin-bottom: 20px;">
                🎉 <strong>You're officially on the PropCloud waitlist!</strong>
              </p>
              
              <p style="color: #718096; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Thank you for joining us on this exciting journey to revolutionize Short Term Rental (STR) investment through conversational AI. You're now part of an exclusive community that will get first access to the future of property investment.
              </p>
            </div>

            <div style="background: #f7fafc; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
              <h3 style="color: #2d3748; font-size: 18px; margin-bottom: 15px;">What happens next?</h3>
              <ul style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">You'll receive exclusive updates on our development progress</li>
                <li style="margin-bottom: 8px;">Get priority access when PropCloud launches</li>
                <li style="margin-bottom: 8px;">Be among the first to experience AI-powered Short Term Rental conversations</li>
                <li>Receive special early-bird pricing and features</li>
              </ul>
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <p style="color: #718096; font-size: 14px; line-height: 1.6;">
                We're working hard to bring you something amazing for your STR investments. Stay tuned for updates!
              </p>
            </div>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 25px; text-align: center;">
              <p style="color: #a0aec0; font-size: 12px; margin-bottom: 10px;">
                This email was sent because you signed up for the PropCloud waitlist.
              </p>
              <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                PropCloud - The Future of Short Term Rental Investment
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, messageId: emailResponse.data?.id }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
