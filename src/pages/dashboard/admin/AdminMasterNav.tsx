import { useLocation } from 'react-router-dom'

const links = [
  { to: '/dashboard/admin/master/school', label: 'School Profile' },
  { to: '/dashboard/admin/master/academic-years', label: 'Academic Years' },
  { to: '/dashboard/admin/master/students', label: 'Students' },
  { to: '/dashboard/admin/master/teachers', label: 'Teachers' },
  { to: '/dashboard/admin/master/groups', label: 'Groups' },
]

export default function AdminMasterNav() {
  const { pathname } = useLocation()

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {links.map((link) => {
        const active = pathname === link.to
        return (
          <a
            key={link.to}
            href={link.to}
            onClick={(e) => {
              e.preventDefault()
              window.history.pushState(null, '', link.to)
              window.dispatchEvent(new PopStateEvent('popstate'))
            }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              active
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 shadow-sm'
            }`}
          >
            {link.label}
          </a>
        )
      })}
    </div>
  )
}
