
-- Enable the pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create properties table with sample Miami real estate data
CREATE TABLE public.properties (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    address TEXT NOT NULL UNIQUE,
    listing_price INT,
    beds INT,
    baths REAL,
    sqft INT,
    description TEXT,
    sales_history JSONB,
    tax_history JSONB,
    permit_history JSONB,
    market_comps JSONB,
    listing_url TEXT,
    image_url TEXT,
    embedding VECTOR(768), -- For semantic search
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for properties
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read properties
CREATE POLICY "Allow authenticated read access" 
ON public.properties 
FOR SELECT 
TO authenticated 
USING (true);

-- Create user profiles table for authenticated users
CREATE TABLE public.profiles (
    id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Create conversations table to store chat history
CREATE TABLE public.conversations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own conversations
CREATE POLICY "Users can view own conversations" 
ON public.conversations 
FOR ALL 
USING (auth.uid() = user_id);

-- Create messages table to store individual chat messages
CREATE TABLE public.messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.conversations ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can only see messages from their own conversations
CREATE POLICY "Users can view own messages" 
ON public.messages 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.conversations 
        WHERE conversations.id = messages.conversation_id 
        AND conversations.user_id = auth.uid()
    )
);

-- Function to handle new user creation (creates profile automatically)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample property data for Miami
INSERT INTO public.properties (address, listing_price, beds, baths, sqft, description, sales_history, tax_history, permit_history, market_comps, listing_url) VALUES
(
    '123 Ocean Drive, Miami Beach, FL 33139',
    850000,
    2,
    2.0,
    1200,
    'Stunning oceanfront condo with panoramic views of the Atlantic Ocean. Recently renovated with high-end finishes throughout.',
    '{"2023": {"price": 820000, "date": "2023-03-15"}, "2021": {"price": 750000, "date": "2021-08-20"}}'::jsonb,
    '{"2024": {"assessment": 780000, "taxes": 18720}, "2023": {"assessment": 750000, "taxes": 18000}}'::jsonb,
    '{"recent_permits": [{"date": "2023-01-10", "type": "Interior Renovation", "value": 45000}, {"date": "2022-06-15", "type": "Electrical Upgrade", "value": 8000}]}'::jsonb,
    '{"avg_nightly_rate": 250, "occupancy_rate": 0.78, "comparable_properties": [{"address": "125 Ocean Drive", "nightly_rate": 275}, {"address": "119 Ocean Drive", "nightly_rate": 230}]}'::jsonb,
    'https://example.com/listing/123-ocean-drive'
),
(
    '456 Collins Avenue, Miami Beach, FL 33139',
    1250000,
    3,
    2.5,
    1800,
    'Luxury beachfront penthouse with private terrace and breathtaking sunset views. Premium building amenities including pool and gym.',
    '{"2024": {"price": 1200000, "date": "2024-01-30"}, "2022": {"price": 1100000, "date": "2022-11-12"}}'::jsonb,
    '{"2024": {"assessment": 1150000, "taxes": 27600}, "2023": {"assessment": 1100000, "taxes": 26400}}'::jsonb,
    '{"recent_permits": [{"date": "2023-08-20", "type": "Terrace Expansion", "value": 25000}]}'::jsonb,
    '{"avg_nightly_rate": 380, "occupancy_rate": 0.85, "comparable_properties": [{"address": "450 Collins Avenue", "nightly_rate": 400}, {"address": "460 Collins Avenue", "nightly_rate": 360}]}'::jsonb,
    'https://example.com/listing/456-collins-avenue'
),
(
    '789 Brickell Avenue, Miami, FL 33131',
    680000,
    1,
    1.0,
    900,
    'Modern downtown condo in the heart of Brickell financial district. Floor-to-ceiling windows with city skyline views.',
    '{"2023": {"price": 650000, "date": "2023-09-10"}, "2021": {"price": 580000, "date": "2021-12-05"}}'::jsonb,
    '{"2024": {"assessment": 620000, "taxes": 14880}, "2023": {"assessment": 600000, "taxes": 14400}}'::jsonb,
    '{"recent_permits": [{"date": "2023-05-15", "type": "Kitchen Remodel", "value": 15000}]}'::jsonb,
    '{"avg_nightly_rate": 180, "occupancy_rate": 0.72, "comparable_properties": [{"address": "785 Brickell Avenue", "nightly_rate": 195}, {"address": "791 Brickell Avenue", "nightly_rate": 165}]}'::jsonb,
    'https://example.com/listing/789-brickell-avenue'
),
(
    '321 Wynwood Street, Miami, FL 33127',
    425000,
    2,
    1.5,
    1100,
    'Trendy loft in the vibrant Wynwood Arts District. Exposed brick walls and industrial design in a hip neighborhood.',
    '{"2024": {"price": 410000, "date": "2024-02-28"}, "2022": {"price": 380000, "date": "2022-07-18"}}'::jsonb,
    '{"2024": {"assessment": 390000, "taxes": 9360}, "2023": {"assessment": 370000, "taxes": 8880}}'::jsonb,
    '{"recent_permits": [{"date": "2023-11-02", "type": "Loft Conversion", "value": 20000}, {"date": "2023-04-12", "type": "HVAC Installation", "value": 12000}]}'::jsonb,
    '{"avg_nightly_rate": 140, "occupancy_rate": 0.80, "comparable_properties": [{"address": "325 Wynwood Street", "nightly_rate": 155}, {"address": "317 Wynwood Street", "nightly_rate": 125}]}'::jsonb,
    'https://example.com/listing/321-wynwood-street'
),
(
    '567 Coral Gables Drive, Coral Gables, FL 33134',
    950000,
    4,
    3.0,
    2400,
    'Elegant Mediterranean-style home in prestigious Coral Gables. Beautiful architecture with tile roof and courtyard garden.',
    '{"2023": {"price": 920000, "date": "2023-06-22"}, "2020": {"price": 850000, "date": "2020-10-30"}}'::jsonb,
    '{"2024": {"assessment": 900000, "taxes": 21600}, "2023": {"assessment": 870000, "taxes": 20880}}'::jsonb,
    '{"recent_permits": [{"date": "2023-03-08", "type": "Pool Installation", "value": 35000}, {"date": "2022-09-14", "type": "Roof Repair", "value": 18000}]}'::jsonb,
    '{"avg_nightly_rate": 320, "occupancy_rate": 0.75, "comparable_properties": [{"address": "565 Coral Gables Drive", "nightly_rate": 340}, {"address": "569 Coral Gables Drive", "nightly_rate": 300}]}'::jsonb,
    'https://example.com/listing/567-coral-gables-drive'
);

-- Create indexes for better performance
CREATE INDEX idx_properties_address ON public.properties(address);
CREATE INDEX idx_properties_price ON public.properties(listing_price);
CREATE INDEX idx_properties_beds_baths ON public.properties(beds, baths);
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
