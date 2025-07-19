
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WelcomeEmailRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: WelcomeEmailRequest = await req.json();

    console.log('Sending welcome email to:', email);

    // Send welcome email using Resend
    const emailResponse = await resend.emails.send({
      from: "PropCloud <contact@propcloud.io>",
      to: [email],
      subject: "Welcome to PropCloud - You're on the waitlist!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Welcome to PropCloud!</h1>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Thank you for joining our waitlist! We're excited to have you as one of our early supporters.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            PropCloud is revolutionizing the way real estate professionals manage their properties and connect with clients. You'll be among the first to experience our innovative platform when we launch.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h2 style="color: #333; margin-top: 0;">What's Next?</h2>
            <ul style="color: #555; line-height: 1.6;">
              <li>We'll keep you updated on our progress</li>
              <li>You'll get early access when we launch</li>
              <li>Exclusive insights into PropCloud features</li>
            </ul>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #555;">
            Stay tuned for more updates, and thank you for being part of the PropCloud journey!
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 14px; color: #888; text-align: center;">
            Best regards,<br>
            The PropCloud Team<br>
            <a href="mailto:contact@propcloud.io" style="color: #007bff;">contact@propcloud.io</a>
          </p>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error('Error sending welcome email:', emailResponse.error);
      throw emailResponse.error;
    }

    console.log('Welcome email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: 'Welcome email sent successfully', data: emailResponse }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error in send-waitlist-welcome function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
