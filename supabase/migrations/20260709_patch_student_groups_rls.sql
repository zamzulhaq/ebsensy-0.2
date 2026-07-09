-- Patch: student_groups RLS — validate both group AND student org
-- Previously only checked group.organization_id, now also checks student.organization_id

DROP POLICY IF EXISTS "org_admin_write_student_groups" ON student_groups;
DROP POLICY IF EXISTS "org_admin_update_student_groups" ON student_groups;

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
