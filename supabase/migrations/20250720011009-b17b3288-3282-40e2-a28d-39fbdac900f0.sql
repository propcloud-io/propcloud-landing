
-- Add approval status and access management to waitlist table
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE;
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS approved_by TEXT;

-- Add access expiration to profiles table for temporary access
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS access_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS access_granted_by TEXT;

-- Pre-approve the test user
UPDATE public.waitlist 
SET approved = TRUE, approved_at = now(), approved_by = 'system' 
WHERE email = 'haider916@gmail.com';

-- Create function to check if user can sign up
CREATE OR REPLACE FUNCTION public.can_user_signup(user_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.waitlist 
    WHERE email = user_email 
    AND approved = true
  );
$$;

-- Create function to grant temporary access
CREATE OR REPLACE FUNCTION public.grant_user_access(
  user_email text,
  expires_days integer DEFAULT 30,
  granted_by_user text DEFAULT 'admin'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- First approve in waitlist if not already approved
  UPDATE public.waitlist 
  SET approved = true, approved_at = now(), approved_by = granted_by_user
  WHERE email = user_email AND approved = false;
  
  -- Update profile with access expiration if user exists
  UPDATE public.profiles 
  SET access_expires_at = now() + interval '1 day' * expires_days,
      access_granted_by = granted_by_user
  WHERE email = user_email;
  
  RETURN true;
END;
$$;

-- Create RLS policy for profile access with expiration check
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile with valid access" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id 
  AND (
    access_expires_at IS NULL 
    OR access_expires_at > now()
    OR email = 'haider916@gmail.com'  -- Permanent access for test user
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_waitlist_approved ON public.waitlist(approved);
CREATE INDEX IF NOT EXISTS idx_waitlist_email_approved ON public.waitlist(email, approved);
CREATE INDEX IF NOT EXISTS idx_profiles_access_expires ON public.profiles(access_expires_at);
