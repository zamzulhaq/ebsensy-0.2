import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const { user, profile, roles, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-md shadow-indigo-100/50 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-indigo-600">
              {profile?.nama?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Selamat Datang, {profile?.nama || 'User'}
          </h1>
          <p className="text-slate-500 mt-1">{user?.email}</p>
        </div>

        <div className="space-y-3 mb-8">
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
            <span className="text-sm text-slate-600">Status Aktivasi</span>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                profile?.status_aktivasi === 'AKTIF'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {profile?.status_aktivasi || 'PENDING'}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
            <span className="text-sm text-slate-600">Role</span>
            <div className="flex gap-1 flex-wrap justify-end">
              {roles.map((r) => (
                <span
                  key={r.role_id}
                  className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg"
                >
                  {r.nama_role}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors cursor-pointer"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
