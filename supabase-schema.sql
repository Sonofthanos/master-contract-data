-- ========================================================
-- Supabase PostgreSQL Migration Script
-- Partner Contract Master Database & Analytics
-- ========================================================

-- Aktifkan ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Buat Tabel Kontrak
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id VARCHAR(50) NOT NULL,
  vendor_name VARCHAR(255) NOT NULL,
  core_business VARCHAR(150),
  vendor_category VARCHAR(50), -- e.g. Small, Medium
  result_selection VARCHAR(50), -- Pass, Pass - Deviation
  rfc VARCHAR(100),
  remarks_sourcing TEXT,
  contract_type VARCHAR(50), -- P, B, Amandemen
  contract_number VARCHAR(150) NOT NULL UNIQUE, -- Conflict target untuk auto-upsert
  period VARCHAR(20),
  contract_date_from DATE,
  contract_date_to DATE,
  draft_sent_date DATE,
  draft_return_date DATE,
  final_approval_date DATE,
  return_to_vendor_date DATE,
  contract_status VARCHAR(50) DEFAULT 'Valid', -- Valid, Expired, No Contract
  subcont_status VARCHAR(50),
  scan_doc_status VARCHAR(20) DEFAULT 'BELUM', -- SUDAH / BELUM
  upload_contract_status VARCHAR(20) DEFAULT 'BELUM', -- SUDAH / BELUM
  outstanding_status VARCHAR(100),
  action_status VARCHAR(50),
  pic_email VARCHAR(150),
  action_date DATE,
  remarks_internal TEXT,
  case_hold_terminate TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexing untuk optimasi query & search
CREATE INDEX IF NOT EXISTS idx_contracts_vendor_id ON contracts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(contract_status);
CREATE INDEX IF NOT EXISTS idx_contracts_core_business ON contracts(core_business);
CREATE INDEX IF NOT EXISTS idx_contracts_date_to ON contracts(contract_date_to);

-- Trigger auto update kolom updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_contracts_modtime ON contracts;
CREATE TRIGGER update_contracts_modtime
BEFORE UPDATE ON contracts
FOR EACH ROW EXECUTE FUNCTION update_modified_column();
