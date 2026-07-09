import { useAuth } from '../hooks/useAuth'

export default function Unauthorized() {
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-yellow-600 text-2xl font-bold">!</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Akun Belum Disetujui
        </h1>
        <p className="text-slate-500 mb-8">
          Your account is waiting for administrator approval.
        </p>
        <button
          onClick={logout}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors cursor-pointer"
        >
          Kembali ke Login
        </button>
      </div>
    </div>
  )
}
