
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WaitlistFormProps {
  onSuccess: () => void;
  size?: "default" | "lg";
  className?: string;
}

export function WaitlistForm({ onSuccess, size = "default", className = "" }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validateEmail(value)) {
      setIsValid(false);
    } else {
      setIsValid(true);
    }
  };

  const sendWelcomeEmail = async (email: string) => {
    try {
      console.log('Attempting to send welcome email to:', email);
      const { data, error } = await supabase.functions.invoke('send-waitlist-welcome', {
        body: { email }
      });

      if (error) {
        console.error('Error sending welcome email:', error);
        return false;
      } else {
        console.log('Welcome email sent successfully:', data);
        return true;
      }
    } catch (error) {
      console.error('Error invoking welcome email function:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !validateEmail(email)) {
      setIsValid(false);
      return;
    }

    setIsLoading(true);

    try {
      // Check for existing email first
      const { data: existingUser } = await supabase
        .from('waitlist')
        .select('email, approved')
        .eq('email', email.toLowerCase())
        .single();

      if (existingUser) {
        if (existingUser.approved) {
          toast({
            title: "You're approved!",
            description: "You can sign up for an account now. Redirecting to signup...",
          });
          setTimeout(() => navigate('/auth'), 2000);
        } else {
          toast({
            title: "Already on waitlist",
            description: "You're already on our waitlist. We'll notify you when approved!",
          });
        }
        setIsLoading(false);
        return;
      }

      // Insert new waitlist entry
      const { error } = await supabase
        .from('waitlist')
        .insert([
          { 
            email: email.toLowerCase(),
            referral_source: document.referrer || 'direct'
          }
        ]);

      if (error) {
        throw error;
      }

      console.log('Waitlist signup successful for:', email);
      
      // Send welcome email (non-blocking)
      const emailSent = await sendWelcomeEmail(email.toLowerCase());
      
      toast({
        title: "Welcome to PropCloud!",
        description: emailSent 
          ? "You're now on our waitlist. Check your email for a welcome message!"
          : "You're now on our waitlist. We'll notify you when approved!",
      });
      
      onSuccess();
      setEmail("");
      
    } catch (error: any) {
      console.error('Error signing up for waitlist:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
        <div className="flex-1 relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={handleEmailChange}
            className={`pl-10 ${
              size === "lg" ? "h-12 text-lg" : ""
            } ${
              !isValid && email ? "border-red-500 focus:ring-red-500" : ""
            } bg-white/10 backdrop-blur-sm border-gray-600 text-white placeholder:text-gray-400`}
            disabled={isLoading}
            required
          />
          {!isValid && email && (
            <p className="text-red-400 text-sm mt-1">Please enter a valid email address</p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isLoading || !email || !isValid}
          size={size}
          className={`${
            size === "lg" ? "px-8 py-3 h-12 text-lg" : ""
          } bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105 active:scale-95 glow-primary min-w-[140px]`}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Joining...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Join Waitlist
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
