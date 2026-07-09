import { useAuth } from '../../hooks/useAuth'

export default function MusyrifDashboard() {
  const { profile } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Selamat Datang, {profile?.nama || 'Musyrif'}
        </h1>
        <p className="text-slate-500 text-sm mt-1">Active workspace: Musyrif</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Santri</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">-</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-slate-500">Today's Activity</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">-</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-slate-500">Notification</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">-</p>
        </div>
      </div>
    </div>
  )
}
