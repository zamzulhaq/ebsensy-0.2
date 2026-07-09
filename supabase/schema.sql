-- EBSENSY Database Schema - Phase 1
-- Multi-Role Auth & WA Verification Flow

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Table: profiles
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  whatsapp TEXT,
  status_aktivasi TEXT NOT NULL DEFAULT 'PENDING' CHECK (status_aktivasi IN ('PENDING', 'AKTIF', 'DITOLAK')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Table: roles
-- ============================================================
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  nama_role TEXT NOT NULL UNIQUE
);

-- Seed roles
INSERT INTO roles (nama_role) VALUES
  ('ADMIN'),
  ('GURU'),
  ('WALI_KELAS'),
  ('MUSYRIF'),
  ('WALI_SANTRI');

-- ============================================================
-- Table: user_roles (junction / multi-role support)
-- ============================================================
CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- ============================================================
-- Table: santri
-- ============================================================
CREATE TABLE santri (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  nisn TEXT,
  wali_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_profiles_status ON profiles(status_aktivasi);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_santri_wali ON santri(wali_id);

-- ============================================================
-- Trigger: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_santri_updated_at
  BEFORE UPDATE ON santri
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Auto-create profile on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nama, status_aktivasi)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nama', SPLIT_PART(NEW.email, '@', 1)),
    'PENDING'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Schema permissions for Supabase roles
-- ============================================================
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, authenticated, service_role;

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE santri ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "service_role_all_profiles" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "users_read_own_roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "service_role_all_user_roles" ON user_roles
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "auth_read_roles" ON roles
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "service_role_all_roles" ON roles
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "auth_read_santri" ON santri
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "service_role_all_santri" ON santri
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- Phase 3: Master Data Foundation
-- ============================================================

-- ============================================================
-- Helper: get organization id for current user
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() LIMIT 1;
$$;

-- ============================================================
-- Helper: check if current user has ADMIN role
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    INNER JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() AND r.nama_role = 'ADMIN'
  );
$$;

-- ============================================================
-- Table: organizations (multi-tenant)
-- ============================================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Table: user_organizations (auth user → org mapping)
-- ============================================================
CREATE TABLE user_organizations (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, organization_id)
);

-- ============================================================
-- Table: academic_years
-- ============================================================
CREATE TABLE academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Table: students (no class stored directly)
-- ============================================================
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  nisn TEXT,
  gender TEXT CHECK (gender IN ('L', 'P')),
  birth_date DATE,
  wali_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'GRADUATED', 'MOVED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Table: teachers
-- ============================================================
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  employee_number TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Table: groups (REGULER, HALAQOH, ASRAMA, EKSKUL)
-- ============================================================
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('REGULER', 'HALAQOH', 'ASRAMA', 'EKSKUL')),
  mentor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Table: student_groups (membership history)
-- ============================================================
CREATE TABLE student_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_academic_years_org ON academic_years(organization_id);
CREATE INDEX idx_students_org ON students(organization_id);
CREATE INDEX idx_teachers_org ON teachers(organization_id);
CREATE INDEX idx_groups_org ON groups(organization_id);
CREATE INDEX idx_groups_academic_year ON groups(academic_year_id);
CREATE INDEX idx_student_groups_student ON student_groups(student_id);
CREATE INDEX idx_student_groups_group ON student_groups(group_id);
CREATE INDEX idx_student_groups_active ON student_groups(active);
CREATE INDEX idx_user_organizations_user ON user_organizations(user_id);

-- ============================================================
-- RLS: Phase 3 tables
-- ============================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_groups ENABLE ROW LEVEL SECURITY;

-- service_role bypass policies (all tables)
CREATE POLICY "service_role_all_organizations" ON organizations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all_user_organizations" ON user_organizations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all_academic_years" ON academic_years FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all_students" ON students FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all_teachers" ON teachers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all_groups" ON groups FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all_student_groups" ON student_groups FOR ALL USING (auth.role() = 'service_role');

-- organizations: authenticated org members can read, admins can update
CREATE POLICY "org_members_read_organizations" ON organizations
  FOR SELECT USING (auth.role() = 'authenticated' AND (id = public.get_user_organization_id()));
CREATE POLICY "org_admins_update_organizations" ON organizations
  FOR UPDATE USING (auth.role() = 'authenticated' AND public.is_admin_user() AND id = public.get_user_organization_id());

-- user_organizations: users read own mapping
CREATE POLICY "users_read_own_org" ON user_organizations
  FOR SELECT USING (user_id = auth.uid());

-- academic_years: org members read, admins write
CREATE POLICY "org_read_academic_years" ON academic_years
  FOR SELECT USING (organization_id = public.get_user_organization_id());
CREATE POLICY "org_admin_write_academic_years" ON academic_years
  FOR INSERT WITH CHECK (public.is_admin_user() AND organization_id = public.get_user_organization_id());
CREATE POLICY "org_admin_update_academic_years" ON academic_years
  FOR UPDATE USING (public.is_admin_user() AND organization_id = public.get_user_organization_id());

-- students: org members read, admins write
CREATE POLICY "org_read_students" ON students
  FOR SELECT USING (organization_id = public.get_user_organization_id());
CREATE POLICY "org_admin_write_students" ON students
  FOR INSERT WITH CHECK (public.is_admin_user() AND organization_id = public.get_user_organization_id());
CREATE POLICY "org_admin_update_students" ON students
  FOR UPDATE USING (public.is_admin_user() AND organization_id = public.get_user_organization_id());

-- teachers: org members read, admins write
CREATE POLICY "org_read_teachers" ON teachers
  FOR SELECT USING (organization_id = public.get_user_organization_id());
CREATE POLICY "org_admin_write_teachers" ON teachers
  FOR INSERT WITH CHECK (public.is_admin_user() AND organization_id = public.get_user_organization_id());
CREATE POLICY "org_admin_update_teachers" ON teachers
  FOR UPDATE USING (public.is_admin_user() AND organization_id = public.get_user_organization_id());

-- groups: org members read, admins write
CREATE POLICY "org_read_groups" ON groups
  FOR SELECT USING (organization_id = public.get_user_organization_id());
CREATE POLICY "org_admin_write_groups" ON groups
  FOR INSERT WITH CHECK (public.is_admin_user() AND organization_id = public.get_user_organization_id());
CREATE POLICY "org_admin_update_groups" ON groups
  FOR UPDATE USING (public.is_admin_user() AND organization_id = public.get_user_organization_id());

-- student_groups: filter through groups org
CREATE POLICY "org_read_student_groups" ON student_groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM groups g WHERE g.id = group_id AND g.organization_id = public.get_user_organization_id()
    )
  );
CREATE POLICY "org_admin_write_student_groups" ON student_groups
  FOR INSERT WITH CHECK (
    public.is_admin_user()
    AND EXISTS (
      SELECT 1 FROM groups g WHERE g.id = group_id AND g.organization_id = public.get_user_organization_id()
    )
    AND EXISTS (
      SELECT 1 FROM students s WHERE s.id = student_id AND s.organization_id = public.get_user_organization_id()
    )
  );
CREATE POLICY "org_admin_update_student_groups" ON student_groups
  FOR UPDATE USING (
    public.is_admin_user()
    AND EXISTS (
      SELECT 1 FROM groups g WHERE g.id = group_id AND g.organization_id = public.get_user_organization_id()
    )
    AND EXISTS (
      SELECT 1 FROM students s WHERE s.id = student_id AND s.organization_id = public.get_user_organization_id()
    )
  );
