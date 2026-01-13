-- ============================================
-- O.R.I SOLAR Auth Schema Setup
-- Must run BEFORE the main schema
-- ============================================

-- Create auth schema (required for Supabase compatibility)
CREATE SCHEMA IF NOT EXISTS auth;

-- Create Supabase-compatible roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role NOLOGIN;
    END IF;
END $$;

-- Grant schema access to roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;

-- Create auth.users table (simplified for local testing)
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    encrypted_password VARCHAR(255),
    email_confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert demo auth users
INSERT INTO auth.users (id, email, email_confirmed_at)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'demo@solar.local', NOW()),
    ('00000000-0000-0000-0000-000000000002', 'admin@solar.local', NOW()),
    ('00000000-0000-0000-0000-000000000003', 'technician@solar.local', NOW())
ON CONFLICT (email) DO NOTHING;

-- Create auth.uid() function (Supabase compatibility)
-- In local dev, returns the first demo user ID
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID AS $$
BEGIN
    -- For local development, return the admin user ID
    -- In production, this is handled by Supabase
    RETURN '00000000-0000-0000-0000-000000000002'::UUID;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create auth.role() function (Supabase compatibility)
CREATE OR REPLACE FUNCTION auth.role()
RETURNS TEXT AS $$
BEGIN
    RETURN 'authenticated';
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA auth TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO postgres;
