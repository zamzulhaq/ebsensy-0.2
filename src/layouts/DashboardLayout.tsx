import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import RoleSwitcher from '../components/dashboard/RoleSwitcher'
import {
  getRouteForRole,
  getLabelForRole,
  saveWorkspace,
  resolveActiveWorkspace,
} from '../pages/dashboard/helpers'

export default function DashboardLayout() {
  const { user, profile, roles, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const roleNames = roles.map((r) => r.nama_role)
  const currentWorkspace = resolveActiveWorkspace(roleNames)

  useEffect(() => {
    if (!currentWorkspace) return
    const expectedPath = `/dashboard/${getRouteForRole(currentWorkspace)}`
    if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
      navigate(expectedPath, { replace: true })
    }
  }, [currentWorkspace, location.pathname, navigate])

  function handleSelectWorkspace(nama_role: string) {
    saveWorkspace(nama_role)
    setSidebarOpen(false)
    navigate(`/dashboard/${getRouteForRole(nama_role)}`, { replace: true })
  }

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const userInitial = profile?.nama?.charAt(0)?.toUpperCase() || 'U'

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col bg-white border-r border-slate-200 z-30">
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-100">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">E</span>
          </div>
          <span className="text-lg font-bold text-slate-800">Ebsensy</span>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto px-4 py-6 space-y-6">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Workspace
            </p>
            {roleNames.map((r) => {
              const isActive = r === currentWorkspace
              return (
                <button
                  key={r}
                  onClick={() => handleSelectWorkspace(r)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {getLabelForRole(r)}
                </button>
              )
            })}
          </div>
        </div>

        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-indigo-600">{userInitial}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-800 truncate">
                {profile?.nama || 'User'}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="md:ml-64 flex flex-col min-h-screen">
        {/* HEADER */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between h-16 px-4 md:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 -ml-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Open sidebar"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h2 className="text-lg font-semibold text-slate-800">
                {currentWorkspace ? getLabelForRole(currentWorkspace) : 'Dashboard'}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <RoleSwitcher />

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center hover:bg-indigo-200 transition-colors cursor-pointer"
                >
                  <span className="text-sm font-bold text-indigo-600">{userInitial}</span>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-lg border border-slate-200 py-2 z-20">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {profile?.nama || 'User'}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                      </div>
                      <div className="px-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-30">
        <div className="flex items-center justify-around h-16 px-2">
          {roleNames.slice(0, 5).map((r) => {
            const isActive = r === currentWorkspace
            return (
              <button
                key={r}
                onClick={() => handleSelectWorkspace(r)}
                className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <span className="text-[10px] leading-tight text-center">
                  {getLabelForRole(r)}
                </span>
                {isActive && <div className="w-1 h-1 bg-indigo-600 rounded-full mt-1" />}
              </button>
            )
          })}
        </div>
      </nav>

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/40 z-40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="md:hidden fixed inset-y-0 left-0 w-64 bg-white z-50 shadow-xl">
            <div className="flex items-center justify-between px-6 h-16 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-sm font-bold">E</span>
                </div>
                <span className="text-lg font-bold text-slate-800">Ebsensy</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close sidebar"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
                  Workspace
                </p>
                {roleNames.map((r) => {
                  const isActive = r === currentWorkspace
                  return (
                    <button
                      key={r}
                      onClick={() => handleSelectWorkspace(r)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {getLabelForRole(r)}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="border-t border-slate-100 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-indigo-600">{userInitial}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {profile?.nama || 'User'}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          </aside>
        </>
      )}

      {/* MOBILE BOTTOM PADDING */}
      <div className="md:hidden h-16" />
    </div>
  )
}
