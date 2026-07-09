const ROLE_ROUTE: Record<string, string> = {
  ADMIN: 'admin',
  GURU: 'guru',
  WALI_KELAS: 'wali-kelas',
  MUSYRIF: 'musyrif',
  WALI_SANTRI: 'wali-santri',
}

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Admin',
  GURU: 'Guru',
  WALI_KELAS: 'Wali Kelas',
  MUSYRIF: 'Musyrif',
  WALI_SANTRI: 'Wali Santri',
}

export function getRouteForRole(nama_role: string): string {
  return ROLE_ROUTE[nama_role] ?? 'admin'
}

export function getLabelForRole(nama_role: string): string {
  return ROLE_LABEL[nama_role] ?? nama_role
}

const STORAGE_KEY = 'ebsensy_active_workspace'

export function getSavedWorkspace(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function saveWorkspace(nama_role: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, nama_role)
  } catch {}
}

export function resolveActiveWorkspace(availableRoles: string[]): string | null {
  if (availableRoles.length === 0) return null
  if (availableRoles.length === 1) return availableRoles[0]
  const saved = getSavedWorkspace()
  if (saved && availableRoles.includes(saved)) return saved
  return availableRoles[0]
}
