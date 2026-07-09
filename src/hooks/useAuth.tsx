import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export interface Profile {
  id: string
  nama: string
  whatsapp: string | null
  status_aktivasi: 'PENDING' | 'AKTIF' | 'DITOLAK'
}

export interface UserRole {
  role_id: number
  nama_role: string
}

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  roles: UserRole[]
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [roles, setRoles] = useState<UserRole[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfileAndRoles = useCallback(async (userId: string) => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileData) {
      setProfile(profileData as Profile)
    }

    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('role_id, roles!inner(nama_role)')
      .eq('user_id', userId)

    if (rolesData) {
      const raw = rolesData as unknown as { role_id: number; roles: { nama_role: string }[] }[]
      setRoles(
        raw.map((r) => ({
          role_id: r.role_id,
          nama_role: r.roles[0]?.nama_role ?? '',
        }))
      )
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    await fetchProfileAndRoles(user.id)
  }, [user, fetchProfileAndRoles])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfileAndRoles(session.user.id).finally(() => setIsLoading(false))
      } else {
        setIsLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
        setProfile(null)
        setRoles([])
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfileAndRoles])

  const login = useCallback(
    async (email: string, password: string): Promise<{ error?: string }> => {
      setIsLoading(true)
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) return { error: error.message }

        const session = (await supabase.auth.getSession()).data.session
        if (session?.user) {
          setUser(session.user)
          await fetchProfileAndRoles(session.user.id)
        }

        return {}
      } finally {
        setIsLoading(false)
      }
    },
    [fetchProfileAndRoles]
  )

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setRoles([])
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        roles,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

export function useRequireAuth() {
  const auth = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!auth.isLoading && !auth.user) {
      navigate('/login', { replace: true })
    }
  }, [auth.isLoading, auth.user, navigate])

  return auth
}
