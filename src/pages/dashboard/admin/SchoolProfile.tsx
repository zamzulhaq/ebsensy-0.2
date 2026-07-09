import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../hooks/useAuth'
import AdminMasterNav from './AdminMasterNav'

export default function SchoolProfile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [org, setOrg] = useState<{
    id: string
    name: string
    address: string | null
    phone: string | null
  } | null>(null)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [orgId, setOrgId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()
      .then(({ data: uo }) => {
        if (!uo) {
          navigate('/dashboard/admin')
          return
        }
        setOrgId(uo.organization_id)
        supabase
          .from('organizations')
          .select('*')
          .eq('id', uo.organization_id)
          .single()
          .then(({ data }) => {
            if (data) {
              setOrg(data)
              setName(data.name)
              setAddress(data.address ?? '')
              setPhone(data.phone ?? '')
            }
          })
      })
  }, [user, navigate])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!orgId || !name.trim()) return
    setSaving(true)
    await supabase
      .from('organizations')
      .update({ name: name.trim(), address: address.trim(), phone: phone.trim() })
      .eq('id', orgId)
    setSaving(false)
  }

  return (
    <div>
      <AdminMasterNav />
      <div className="bg-white rounded-2xl p-6 shadow-sm max-w-2xl">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">School Profile</h2>
        {!org ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Sekolah</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Alamat</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telepon</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
