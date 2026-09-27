-- ============================================================================
-- SUPERUMKM PLATFORM - SUPABASE POSTGRESQL FULL SCHEMA DDL & SEED DATA
-- Salin seluruh skrip ini dan jalankan di SQL Editor Supabase Dashboard Anda.
-- ============================================================================

-- 1. Table: users
CREATE TABLE IF NOT EXISTS public.users (
  id VARCHAR(64) PRIMARY KEY,
  phone_number VARCHAR(32) UNIQUE NOT NULL,
  full_name VARCHAR(128) NOT NULL,
  role_code VARCHAR(32) NOT NULL DEFAULT 'UMKM_OWNER_FREE',
  owner_id VARCHAR(64),
  pin VARCHAR(16),
  two_factor_secret VARCHAR(128),
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  subscription_tier VARCHAR(32) DEFAULT 'FREE',
  subscription_expires_at TIMESTAMPTZ,
  status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table: business_profiles
CREATE TABLE IF NOT EXISTS public.business_profiles (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES public.users(id) ON DELETE CASCADE,
  business_name VARCHAR(128) NOT NULL,
  category VARCHAR(64),
  address_text TEXT,
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  gmaps_url TEXT,
  landing_page_slug VARCHAR(128) UNIQUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table: pos_staff
CREATE TABLE IF NOT EXISTS public.pos_staff (
  id VARCHAR(64) PRIMARY KEY,
  owner_id VARCHAR(64) REFERENCES public.users(id) ON DELETE CASCADE,
  user_id VARCHAR(64) REFERENCES public.users(id) ON DELETE CASCADE,
  staff_name VARCHAR(128) NOT NULL,
  phone_number VARCHAR(32),
  address TEXT,
  role_title VARCHAR(64),
  pin VARCHAR(16) DEFAULT '1234',
  allowed_permissions JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(16) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table: pos_transactions
CREATE TABLE IF NOT EXISTS public.pos_transactions (
  id VARCHAR(64) PRIMARY KEY,
  owner_id VARCHAR(64) REFERENCES public.users(id) ON DELETE CASCADE,
  cashier_id VARCHAR(64),
  cashier_name VARCHAR(128),
  customer_name VARCHAR(128),
  customer_address TEXT,
  queue_no VARCHAR(32),
  business_name VARCHAR(128),
  business_address TEXT,
  business_phone VARCHAR(32),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  change_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(32) DEFAULT 'Cash',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Table: cashflow_records
CREATE TABLE IF NOT EXISTS public.cashflow_records (
  id VARCHAR(64) PRIMARY KEY,
  owner_id VARCHAR(64) REFERENCES public.users(id) ON DELETE CASCADE,
  type VARCHAR(16) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
  category VARCHAR(64) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Table: customer_contacts
CREATE TABLE IF NOT EXISTS public.customer_contacts (
  id VARCHAR(64) PRIMARY KEY,
  owner_id VARCHAR(64) REFERENCES public.users(id) ON DELETE CASCADE,
  customer_name VARCHAR(128) NOT NULL,
  phone_number VARCHAR(32),
  source VARCHAR(32) DEFAULT 'POS_RECEIPT',
  total_visits INT DEFAULT 1,
  total_spent NUMERIC(12, 2) DEFAULT 0,
  last_visit_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Table: inventory_items
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id VARCHAR(64) PRIMARY KEY,
  owner_id VARCHAR(64) REFERENCES public.users(id) ON DELETE CASCADE,
  item_name VARCHAR(128) NOT NULL,
  category VARCHAR(64),
  unit_price NUMERIC(12, 2) DEFAULT 0,
  current_stock INT DEFAULT 0,
  min_stock INT DEFAULT 5,
  supplier_name VARCHAR(128),
  supplier_phone VARCHAR(32),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Table: qris_transactions
CREATE TABLE IF NOT EXISTS public.qris_transactions (
  id VARCHAR(64) PRIMARY KEY,
  owner_id VARCHAR(64) REFERENCES public.users(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  qr_string TEXT,
  qr_code_svg TEXT,
  status VARCHAR(16) DEFAULT 'PENDING',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Table: service_requests
CREATE TABLE IF NOT EXISTS public.service_requests (
  id VARCHAR(64) PRIMARY KEY,
  client_id VARCHAR(64) REFERENCES public.users(id) ON DELETE CASCADE,
  service_type VARCHAR(128) NOT NULL,
  current_status VARCHAR(32) DEFAULT 'ASSIGNED',
  requirement_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Table: service_tasks
CREATE TABLE IF NOT EXISTS public.service_tasks (
  id VARCHAR(64) PRIMARY KEY,
  request_id VARCHAR(64) REFERENCES public.service_requests(id) ON DELETE CASCADE,
  consultant_id VARCHAR(64) REFERENCES public.users(id) ON DELETE SET NULL,
  task_step VARCHAR(128),
  proof_evidence_url TEXT,
  task_status VARCHAR(32) DEFAULT 'IN_PROGRESS',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Table: tutorial_contents
CREATE TABLE IF NOT EXISTS public.tutorial_contents (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(256) NOT NULL,
  description TEXT,
  module_category VARCHAR(64),
  video_url TEXT,
  duration_seconds INT DEFAULT 0,
  minimum_tier VARCHAR(16) DEFAULT 'FREE',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Table: user_kits
CREATE TABLE IF NOT EXISTS public.user_kits (
  user_id VARCHAR(64) PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  kit_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable Row Level Security (RLS) for Backend Service Role / API direct access (Opsional)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashflow_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.qris_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_contents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_kits DISABLE ROW LEVEL SECURITY;

-- SEED DATA AWAL
INSERT INTO public.users (id, phone_number, full_name, role_code, status) VALUES
  ('u-free-001', '081234567890', 'Budi Santoso (Warung Kelontong)', 'UMKM_OWNER_FREE', 'ACTIVE'),
  ('u-prem-002', '089876543210', 'Siti Rahma (Kopi Senja Premium)', 'UMKM_OWNER_PREMIUM', 'ACTIVE'),
  ('u-cashier-005', '081122334455', 'Dewi (Kasir Warung Berkah)', 'CASHIER', 'ACTIVE'),
  ('u-agent-003', '085551234567', 'Rian Hidayat (Konsultan Wilayah Jakarta)', 'FIELD_AGENT', 'ACTIVE'),
  ('u-admin-004', '080011223344', 'Super Admin System', 'SUPER_ADMIN', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.business_profiles (id, user_id, business_name, category, address_text, latitude, longitude, gmaps_url, landing_page_slug) VALUES
  ('bp-001', 'u-free-001', 'Warung Kelontong Berkah', 'Retail / Sembako', 'Jl. Melati No. 12, Jakarta Selatan', -6.2088, 106.8456, 'https://maps.google.com/?q=Warung+Berkah', 'warung-berkah'),
  ('bp-002', 'u-prem-002', 'Kopi Senja Premium', 'Food & Beverage', 'Jl. Senopati No. 45, Jakarta Selatan', -6.2311, 106.8099, 'https://maps.google.com/?q=Kopi+Senja+Premium', 'kopi-senja-premium')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.tutorial_contents (id, title, description, module_category, video_url, duration_seconds, minimum_tier, is_active) VALUES
  ('tut-001', 'Cara Klaim & Verifikasi Google Maps Tempat Usaha', 'Panduan praktis mendaftarkan titik lokasi toko UMKM di Google Maps dan verifikasi instan.', 'Google Maps Optimization', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 300, 'FREE', true),
  ('tut-002', 'Trik Mendapatkan 100+ Bintang 5 Review Pelanggan', 'Cara menggunakan QR Code Review interaktif untuk mendorong pembeli memberikan ulasan positif.', 'Review Management', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 450, 'FREE', true)
ON CONFLICT (id) DO NOTHING;
