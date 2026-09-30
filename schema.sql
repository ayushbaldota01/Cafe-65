-- Run this entire script in the Supabase SQL Editor

-- 1. Create the orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    items JSONB NOT NULL,
    subtotal NUMERIC NOT NULL,
    delivery_fee NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    customer_address JSONB NOT NULL,
    status TEXT NOT NULL,
    status_timestamps JSONB NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL,
    "riderLocation" JSONB
);

-- 2. Create the items table (for the menu)
CREATE TABLE IF NOT EXISTS public.items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    base_price NUMERIC NOT NULL,
    category TEXT NOT NULL,
    is_veg BOOLEAN NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    variants JSONB,
    variant_type TEXT,
    addons JSONB
);

-- 3. Enable Realtime for the orders table
-- This is critical so the Rider and Order Tracking maps update instantly!
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- 4. (Optional) Set up basic Row Level Security (RLS)
-- For a quick launch, you can leave these fully accessible, or uncomment below to secure it:
/*
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.orders FOR UPDATE USING (true);
*/
