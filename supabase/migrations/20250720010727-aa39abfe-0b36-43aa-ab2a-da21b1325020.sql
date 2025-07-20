
-- Create a function to match properties using vector similarity
CREATE OR REPLACE FUNCTION match_properties(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 3
)
RETURNS TABLE (
  id uuid,
  address text,
  listing_price integer,
  beds integer,
  baths real,
  sqft integer,
  description text,
  sales_history jsonb,
  tax_history jsonb,
  permit_history jsonb,
  market_comps jsonb,
  listing_url text,
  image_url text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    p.id,
    p.address,
    p.listing_price,
    p.beds,
    p.baths,
    p.sqft,
    p.description,
    p.sales_history,
    p.tax_history,
    p.permit_history,
    p.market_comps,
    p.listing_url,
    p.image_url,
    1 - (p.embedding <=> query_embedding) as similarity
  FROM properties p
  WHERE p.embedding IS NOT NULL
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
$$;
