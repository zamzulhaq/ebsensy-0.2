import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getRouteForRole, getLabelForRole, saveWorkspace, resolveActiveWorkspace } from '../../pages/dashboard/helpers'

interface RoleSwitcherProps {
  onClose?: () => void
}

export default function RoleSwitcher({ onClose }: RoleSwitcherProps) {
  const { roles } = useAuth()
  const navigate = useNavigate()

  const currentWorkspace = resolveActiveWorkspace(roles.map((r) => r.nama_role))

  function handleSwitch(nama_role: string) {
    saveWorkspace(nama_role)
    onClose?.()
    navigate(`/dashboard/${getRouteForRole(nama_role)}`, { replace: true })
  }

  if (roles.length <= 1) return null

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
        Workspace
      </p>
      {roles.map((r) => {
        const isActive = r.nama_role === currentWorkspace
        return (
          <button
            key={r.role_id}
            onClick={() => handleSwitch(r.nama_role)}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              isActive
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {getLabelForRole(r.nama_role)}
          </button>
        )
      })}
    </div>
  )
}
