-- ============================================
-- O.R.I SOLAR Demo Data
-- Runs AFTER the main schema
-- ============================================

-- Insert demo users into public.users
INSERT INTO users (id, email, full_name, role)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'demo@solar.local', 'Demo User', 'viewer'),
    ('00000000-0000-0000-0000-000000000002', 'admin@solar.local', 'Admin User', 'administrator'),
    ('00000000-0000-0000-0000-000000000003', 'technician@solar.local', 'Field Technician', 'field_technician')
ON CONFLICT (id) DO NOTHING;

-- Create demo customers
INSERT INTO customers (
    id,
    first_name,
    last_name,
    id_number,
    email,
    phone_primary,
    customer_type,
    residential_city,
    residential_street,
    residential_number,
    property_city,
    property_street,
    property_number,
    iec_contract_number,
    notes
)
VALUES
    (
        '00000000-0000-0000-0000-000000000100',
        'יוסי',
        'כהן',
        '123456789',
        'yossi@example.com',
        '050-1234567',
        'private',
        'תל אביב',
        'רוטשילד',
        '10',
        'תל אביב',
        'רוטשילד',
        '10',
        'IEC-2024-001',
        'לקוח לדוגמה - מערכת ביתית'
    ),
    (
        '00000000-0000-0000-0000-000000000101',
        'שרה',
        'לוי',
        '987654321',
        'sarah@example.com',
        '052-9876543',
        'private',
        'ירושלים',
        'יפו',
        '25',
        'ירושלים',
        'יפו',
        '25',
        'IEC-2024-002',
        'לקוח לדוגמה - מערכת על גג רעפים'
    ),
    (
        '00000000-0000-0000-0000-000000000102',
        'משה',
        'ישראלי',
        '555555555',
        'moshe@business.com',
        '03-5555555',
        'business',
        'חיפה',
        'הנמל',
        '100',
        'חיפה',
        'התעשייה',
        '50',
        'IEC-2024-003',
        'לקוח עסקי - מפעל'
    )
ON CONFLICT (id) DO NOTHING;

-- Create demo professionals
INSERT INTO professionals (
    id,
    professional_type,
    name,
    company_name,
    email,
    phone,
    license_number,
    is_electrician
)
VALUES
    (
        '00000000-0000-0000-0000-000000000200',
        'installing_company',
        'Solar Pro Ltd',
        'Solar Pro בע"מ',
        'info@solarpro.com',
        '03-1234567',
        'INST-001',
        false
    ),
    (
        '00000000-0000-0000-0000-000000000201',
        'inspecting_electrician',
        'דוד חשמלאי',
        NULL,
        'david@electric.com',
        '054-1111111',
        'ELEC-001',
        true
    ),
    (
        '00000000-0000-0000-0000-000000000202',
        'constructor',
        'קונסטרוקציות ישראל',
        'קונסטרוקציות ישראל בע"מ',
        'info@construct.co.il',
        '03-2222222',
        'CONST-001',
        false
    ),
    (
        '00000000-0000-0000-0000-000000000203',
        'planner',
        'מהנדסי סולאר',
        'מהנדסי סולאר בע"מ',
        'plan@solar.co.il',
        '03-3333333',
        'PLAN-001',
        false
    )
ON CONFLICT (id) DO NOTHING;

-- Create demo projects
INSERT INTO projects (
    id,
    customer_id,
    name,
    description,
    status,
    current_stage,
    system_size_kw,
    panel_count,
    inverter_model,
    estimated_annual_production,
    start_date,
    estimated_completion_date
)
VALUES
    (
        '00000000-0000-0000-0000-000000000300',
        '00000000-0000-0000-0000-000000000100',
        'מערכת סולארית - רוטשילד 10',
        'התקנת מערכת סולארית ביתית 10kW',
        'in_progress',
        'payment_processed',
        10.00,
        25,
        'SolarEdge SE10K',
        15000.00,
        CURRENT_DATE - INTERVAL '30 days',
        CURRENT_DATE + INTERVAL '30 days'
    ),
    (
        '00000000-0000-0000-0000-000000000301',
        '00000000-0000-0000-0000-000000000101',
        'מערכת סולארית - יפו 25',
        'התקנת מערכת סולארית על גג רעפים 8kW',
        'pending',
        'request_opened',
        8.00,
        20,
        'Fronius Primo 8.2',
        12000.00,
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '60 days'
    ),
    (
        '00000000-0000-0000-0000-000000000302',
        '00000000-0000-0000-0000-000000000102',
        'מערכת תעשייתית - חיפה',
        'התקנת מערכת סולארית תעשייתית 100kW',
        'in_progress',
        'sync_request',
        100.00,
        250,
        'Huawei SUN2000-100KTL-M1',
        150000.00,
        CURRENT_DATE - INTERVAL '60 days',
        CURRENT_DATE + INTERVAL '15 days'
    )
ON CONFLICT (id) DO NOTHING;

-- Assign professionals to projects
INSERT INTO project_professionals (project_id, professional_id, role)
VALUES
    ('00000000-0000-0000-0000-000000000300', '00000000-0000-0000-0000-000000000200', 'Installing Company'),
    ('00000000-0000-0000-0000-000000000300', '00000000-0000-0000-0000-000000000201', 'Inspecting Electrician'),
    ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000200', 'Installing Company'),
    ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000200', 'Installing Company'),
    ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000202', 'Constructor'),
    ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000203', 'Planner')
ON CONFLICT (project_id, professional_id) DO NOTHING;

-- Create demo tasks
INSERT INTO tasks (
    id,
    project_id,
    customer_id,
    assigned_to,
    title,
    description,
    priority,
    status,
    due_date
)
VALUES
    (
        '00000000-0000-0000-0000-000000000400',
        '00000000-0000-0000-0000-000000000300',
        '00000000-0000-0000-0000-000000000100',
        '00000000-0000-0000-0000-000000000003',
        'בדיקת גג והתקנת קונסטרוקציה',
        'לבצע בדיקת גג ראשונית והתקנת קונסטרוקציה לפאנלים',
        'high',
        'in_progress',
        CURRENT_DATE + INTERVAL '7 days'
    ),
    (
        '00000000-0000-0000-0000-000000000401',
        '00000000-0000-0000-0000-000000000300',
        '00000000-0000-0000-0000-000000000100',
        '00000000-0000-0000-0000-000000000003',
        'התקנת פאנלים',
        'התקנת 25 פאנלים סולאריים',
        'medium',
        'pending',
        CURRENT_DATE + INTERVAL '14 days'
    ),
    (
        '00000000-0000-0000-0000-000000000402',
        '00000000-0000-0000-0000-000000000301',
        '00000000-0000-0000-0000-000000000101',
        NULL,
        'קביעת פגישה עם הלקוח',
        'יצירת קשר עם הלקוח לקביעת פגישה ראשונית',
        'urgent',
        'pending',
        CURRENT_DATE + INTERVAL '2 days'
    ),
    (
        '00000000-0000-0000-0000-000000000403',
        '00000000-0000-0000-0000-000000000302',
        '00000000-0000-0000-0000-000000000102',
        '00000000-0000-0000-0000-000000000003',
        'בדיקת סנכרון עם חברת החשמל',
        'לוודא שהבקשה לסנכרון נשלחה ולעקוב אחר הסטטוס',
        'high',
        'in_progress',
        CURRENT_DATE + INTERVAL '5 days'
    )
ON CONFLICT (id) DO NOTHING;

-- Create demo installation stages
INSERT INTO installation_stages (project_id, stage, completed, completed_at, completed_by, notes)
VALUES
    ('00000000-0000-0000-0000-000000000300', 'request_opened', true, CURRENT_DATE - INTERVAL '25 days', '00000000-0000-0000-0000-000000000002', 'בקשה נפתחה במערכת'),
    ('00000000-0000-0000-0000-000000000300', 'payment_processed', true, CURRENT_DATE - INTERVAL '20 days', '00000000-0000-0000-0000-000000000002', 'תשלום התקבל'),
    ('00000000-0000-0000-0000-000000000302', 'request_opened', true, CURRENT_DATE - INTERVAL '55 days', '00000000-0000-0000-0000-000000000002', 'פרויקט תעשייתי גדול'),
    ('00000000-0000-0000-0000-000000000302', 'payment_processed', true, CURRENT_DATE - INTERVAL '50 days', '00000000-0000-0000-0000-000000000002', 'תשלום מקדמה התקבל'),
    ('00000000-0000-0000-0000-000000000302', 'department_response', true, CURRENT_DATE - INTERVAL '40 days', '00000000-0000-0000-0000-000000000002', 'אישור מחלקת תכנון התקבל'),
    ('00000000-0000-0000-0000-000000000302', 'sync_compliance_request', true, CURRENT_DATE - INTERVAL '30 days', '00000000-0000-0000-0000-000000000002', 'בקשת תאימות סנכרון נשלחה'),
    ('00000000-0000-0000-0000-000000000302', 'sync_request', false, NULL, NULL, 'ממתין לאישור סנכרון')
ON CONFLICT (project_id, stage) DO NOTHING;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Allow all operations for local development
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for local dev' AND tablename = 'professionals') THEN
        CREATE POLICY "Allow all for local dev" ON professionals FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for local dev' AND tablename = 'project_professionals') THEN
        CREATE POLICY "Allow all for local dev" ON project_professionals FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for local dev' AND tablename = 'installation_stages') THEN
        CREATE POLICY "Allow all for local dev" ON installation_stages FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for local dev' AND tablename = 'forms') THEN
        CREATE POLICY "Allow all for local dev" ON forms FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for local dev' AND tablename = 'documents') THEN
        CREATE POLICY "Allow all for local dev" ON documents FOR ALL USING (true);
    END IF;
END $$;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'O.R.I SOLAR demo data loaded successfully!';
    RAISE NOTICE 'Demo users: demo@solar.local, admin@solar.local, technician@solar.local';
    RAISE NOTICE 'Demo customers: 3 customers';
    RAISE NOTICE 'Demo projects: 3 projects';
    RAISE NOTICE 'Demo tasks: 4 tasks';
END $$;
