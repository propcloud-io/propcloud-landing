
-- Create waitlist table for email capture
CREATE TABLE public.waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  referral_source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) - making it public since it's a waitlist
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to insert into waitlist (public signup)
CREATE POLICY "Anyone can sign up for waitlist" 
  ON public.waitlist 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy that allows reading waitlist entries (for admin purposes)
CREATE POLICY "Anyone can view waitlist entries" 
  ON public.waitlist 
  FOR SELECT 
  USING (true);

-- Create index for faster email lookups
CREATE INDEX idx_waitlist_email ON public.waitlist(email);

-- Create index for faster date queries
CREATE INDEX idx_waitlist_created_at ON public.waitlist(created_at);
