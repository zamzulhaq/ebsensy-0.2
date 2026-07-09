import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const modules = [
  { label: 'School Profile', path: 'master/school-profile', desc: 'Edit profil sekolah', icon: '🏫' },
  { label: 'Academic Years', path: 'master/academic-years', desc: 'Kelola tahun ajaran', icon: '📅' },
  { label: 'Students', path: 'master/students', desc: 'Data santri', icon: '👨‍🎓' },
  { label: 'Teachers', path: 'master/teachers', desc: 'Data guru & karyawan', icon: '👩‍🏫' },
  { label: 'Groups', path: 'master/groups', desc: 'Reguler / Halaqoh / Asrama / Ekskul', icon: '👥' },
]

export default function AdminDashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Selamat Datang, {profile?.nama || 'Admin'}
        </h1>
        <p className="text-slate-500 text-sm mt-1">Active workspace: Admin</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((m) => (
          <button
            key={m.path}
            onClick={() => navigate(m.path)}
            className="bg-white rounded-2xl p-6 shadow-sm text-left hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <div className="text-2xl mb-2">{m.icon}</div>
            <p className="font-semibold text-slate-800">{m.label}</p>
            <p className="text-sm text-slate-400 mt-0.5">{m.desc}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
