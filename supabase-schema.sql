-- O.R.I SOLAR Database Schema
-- Solar Installation Management System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE customer_type AS ENUM ('private', 'business', 'institutional');
CREATE TYPE project_status AS ENUM ('pending', 'in_progress', 'completed', 'on_hold', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE installation_stage AS ENUM (
  'request_opened',
  'payment_processed',
  'department_response',
  'sync_compliance_request',
  'sync_request',
  'sync_complete',
  'commercial_activation',
  'standing_order_form'
);
CREATE TYPE professional_type AS ENUM (
  'installing_company',
  'installing_contractor',
  'planner',
  'inspecting_electrician',
  'constructor'
);
CREATE TYPE user_role AS ENUM ('administrator', 'manager', 'office_staff', 'field_technician', 'viewer');
CREATE TYPE form_status AS ENUM ('draft', 'review', 'signature_pending', 'submitted', 'approved', 'rejected');

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'viewer',
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Personal Information
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    id_number TEXT, -- ת.ז
    email TEXT,
    phone_primary TEXT NOT NULL,
    phone_secondary TEXT,
    customer_type customer_type DEFAULT 'private',
    billing_method TEXT, -- מסלול התחשבנות
    -- Residential Address
    residential_city TEXT, -- יישוב
    residential_street TEXT, -- רחוב
    residential_number TEXT,
    residential_apartment TEXT,
    residential_postal_code TEXT,
    -- Property Address (Installation Site)
    property_city TEXT,
    property_street TEXT,
    property_number TEXT,
    property_apartment TEXT,
    property_postal_code TEXT,
    property_block TEXT, -- גוש
    property_parcel TEXT, -- חלקה
    property_sub_parcel TEXT, -- תת חלקה
    property_lot TEXT, -- מגרש
    -- IEC Information (מזהה חח"י)
    iec_contract_number TEXT, -- מספר חוזה
    iec_order_number TEXT, -- מספר הזמנה
    iec_meter_number TEXT, -- מספר מונה
    iec_network_division TEXT, -- אגף רשת
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status project_status DEFAULT 'pending',
    current_stage installation_stage DEFAULT 'request_opened',
    -- System specifications
    system_size_kw DECIMAL(10, 2),
    panel_count INTEGER,
    inverter_model TEXT,
    estimated_annual_production DECIMAL(10, 2), -- kWh
    -- Monitoring configuration
    monitoring_config JSONB, -- { provider: 'solaredge'|'enphase', systemId: string, apiKey?: string }
    -- Timeline
    start_date DATE,
    estimated_completion_date DATE,
    actual_completion_date DATE,
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Professionals table
CREATE TABLE IF NOT EXISTS professionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_type professional_type NOT NULL,
    name TEXT NOT NULL,
    company_name TEXT, -- For installing companies
    company_id TEXT, -- ח.פ
    id_number TEXT, -- ת.ז
    email TEXT,
    phone TEXT,
    license_type TEXT,
    license_number TEXT,
    license_expiry DATE,
    license_document_url TEXT,
    is_electrician BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project-Professional assignments
CREATE TABLE IF NOT EXISTS project_professionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    role TEXT, -- Specific role in this project
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, professional_id)
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority task_priority DEFAULT 'medium',
    status task_status DEFAULT 'pending',
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Installation stages tracking
CREATE TABLE IF NOT EXISTS installation_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    stage installation_stage NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, stage)
);

-- Forms table
CREATE TABLE IF NOT EXISTS forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    form_type TEXT NOT NULL,
    form_name TEXT NOT NULL,
    form_name_he TEXT NOT NULL, -- Hebrew name
    status form_status DEFAULT 'draft',
    form_data JSONB, -- Actual form field data
    form_version INTEGER DEFAULT 1, -- Track form versions
    required_signature TEXT, -- Who needs to sign
    signed_by TEXT,
    signed_at TIMESTAMP WITH TIME ZONE,
    signature_data TEXT, -- Base64 encoded signature image
    document_url TEXT,
    submitted_by UUID REFERENCES users(id),
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_by UUID REFERENCES users(id),
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone_primary);
CREATE INDEX idx_projects_customer ON projects(customer_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_forms_project ON forms(project_id);
CREATE INDEX idx_documents_project ON documents(project_id);
CREATE INDEX idx_documents_customer ON documents(customer_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE installation_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- RLS Policies for customers (authenticated users can view/manage)
CREATE POLICY "Authenticated users can view customers"
    ON customers FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Staff can manage customers"
    ON customers FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('administrator', 'manager', 'office_staff')
        )
    );

-- RLS Policies for projects
CREATE POLICY "Authenticated users can view projects"
    ON projects FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Staff can manage projects"
    ON projects FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('administrator', 'manager', 'office_staff')
        )
    );

-- RLS Policies for tasks
CREATE POLICY "Users can view assigned tasks"
    ON tasks FOR SELECT
    TO authenticated
    USING (
        assigned_to = auth.uid()
        OR EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('administrator', 'manager', 'office_staff')
        )
    );

CREATE POLICY "Staff can manage tasks"
    ON tasks FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('administrator', 'manager', 'office_staff')
        )
    );

CREATE POLICY "Field technicians can update own tasks"
    ON tasks FOR UPDATE
    TO authenticated
    USING (assigned_to = auth.uid());

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professionals_updated_at
    BEFORE UPDATE ON professionals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forms_updated_at
    BEFORE UPDATE ON forms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit logs table for tracking all user actions
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for audit logs
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- Enable RLS for audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit logs (only admins and managers can view)
CREATE POLICY "Admins can view audit logs"
    ON audit_logs FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('administrator', 'manager')
        )
    );

-- Notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_assigned BOOLEAN DEFAULT TRUE,
    project_status BOOLEAN DEFAULT TRUE,
    form_approved BOOLEAN DEFAULT TRUE,
    form_rejected BOOLEAN DEFAULT TRUE,
    license_expiry BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Index for notification preferences
CREATE INDEX idx_notification_preferences_user ON notification_preferences(user_id);

-- Enable RLS for notification preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification preferences (users can only view/update their own)
CREATE POLICY "Users can view own notification preferences"
    ON notification_preferences FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can update own notification preferences"
    ON notification_preferences FOR ALL
    TO authenticated
    USING (user_id = auth.uid());

-- Trigger to update updated_at for notification preferences
CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: Form templates should be inserted with actual project_id
-- Template inserts removed due to NOT NULL constraint on project_id
