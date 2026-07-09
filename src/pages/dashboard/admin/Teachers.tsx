import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../hooks/useAuth'
import AdminMasterNav from './AdminMasterNav'

interface Teacher {
  id: string
  profile_id: string
  employee_number: string | null
  status: string
  profiles: { nama: string } | null
}

export default function Teachers() {
  const { user } = useAuth()
  const [items, setItems] = useState<Teacher[]>([])
  const [orgId, setOrgId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Teacher | null>(null)
  const [form, setForm] = useState({ profile_id: '', employee_number: '' })

  useEffect(() => {
    if (!user) return
    supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setOrgId(data.organization_id)
          load(data.organization_id)
        }
      })
  }, [user])

  async function load(oid: string) {
    const { data } = await supabase
      .from('teachers')
      .select('*, profiles!inner(id, nama)')
      .eq('organization_id', oid)
      .order('created_at', { ascending: false })
    if (data) setItems(data as unknown as Teacher[])
  }

  function openCreate() {
    setEditing(null)
    setForm({ profile_id: '', employee_number: '' })
    setShowModal(true)
  }

  function openEdit(item: Teacher) {
    setEditing(item)
    setForm({ profile_id: item.profile_id, employee_number: item.employee_number ?? '' })
    setShowModal(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!orgId) return
    if (editing) {
      await supabase.from('teachers').update({
        employee_number: form.employee_number || null,
      }).eq('id', editing.id)
    } else {
      await supabase.from('teachers').insert({
        organization_id: orgId,
        profile_id: form.profile_id,
        employee_number: form.employee_number || null,
      })
    }
    setShowModal(false)
    load(orgId)
  }

  async function toggleStatus(item: Teacher) {
    const newStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    await supabase.from('teachers').update({ status: newStatus }).eq('id', item.id)
    if (orgId) load(orgId)
  }

  return (
    <div>
      <AdminMasterNav />
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Teachers</h2>
          <button onClick={openCreate}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors cursor-pointer">+ Tambah</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-100">
                <th className="pb-3 font-medium">Nama</th>
                <th className="pb-3 font-medium">NIP</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="py-3 text-slate-800 font-medium">{item.profiles?.nama || item.profile_id.slice(0, 8)}</td>
                  <td className="py-3 text-slate-600">{item.employee_number || '-'}</td>
                  <td className="py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      item.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>{item.status}</span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(item)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer">Edit</button>
                      <button onClick={() => toggleStatus(item)}
                        className={`text-xs font-medium cursor-pointer ${
                          item.status === 'ACTIVE' ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'
                        }`}>{item.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-slate-400">Belum ada guru.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">{editing ? 'Edit Guru' : 'Tambah Guru'}</h3>
              <form onSubmit={handleSave} className="space-y-4">
                {!editing && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Profile ID</label>
                    <input type="text" value={form.profile_id}
                      onChange={(e) => setForm({ ...form, profile_id: e.target.value })}
                      placeholder="UUID dari tabel profiles"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none" required />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">NIP / Employee Number</label>
                  <input type="text" value={form.employee_number}
                    onChange={(e) => setForm({ ...form, employee_number: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors cursor-pointer">Batal</button>
                  <button type="submit"
                    className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors cursor-pointer">{editing ? 'Simpan' : 'Tambah'}</button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
