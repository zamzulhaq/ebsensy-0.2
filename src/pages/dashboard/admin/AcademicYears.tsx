import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../hooks/useAuth'
import AdminMasterNav from './AdminMasterNav'

interface AcademicYear {
  id: string
  name: string
  start_date: string
  end_date: string
  is_active: boolean
}

export default function AcademicYears() {
  const { user } = useAuth()
  const [items, setItems] = useState<AcademicYear[]>([])
  const [orgId, setOrgId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<AcademicYear | null>(null)
  const [form, setForm] = useState({ name: '', start_date: '', end_date: '' })

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
      .from('academic_years')
      .select('*')
      .eq('organization_id', oid)
      .order('start_date', { ascending: false })
    if (data) setItems(data)
  }

  function openCreate() {
    setEditing(null)
    setForm({ name: '', start_date: '', end_date: '' })
    setShowModal(true)
  }

  function openEdit(item: AcademicYear) {
    setEditing(item)
    setForm({ name: item.name, start_date: item.start_date, end_date: item.end_date })
    setShowModal(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!orgId) return
    if (editing) {
      await supabase.from('academic_years').update(form).eq('id', editing.id)
    } else {
      await supabase.from('academic_years').insert({
        organization_id: orgId,
        ...form,
      })
    }
    setShowModal(false)
    load(orgId)
  }

  async function toggleActive(item: AcademicYear) {
    if (!orgId) return
    if (item.is_active) {
      await supabase.from('academic_years').update({ is_active: false }).eq('id', item.id)
    } else {
      await supabase.from('academic_years').update({ is_active: false }).eq('organization_id', orgId)
      await supabase.from('academic_years').update({ is_active: true }).eq('id', item.id)
    }
    load(orgId)
  }

  return (
    <div>
      <AdminMasterNav />
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Academic Years</h2>
          <button
            onClick={openCreate}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors cursor-pointer"
          >
            + Tambah
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-100">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Start</th>
                <th className="pb-3 font-medium">End</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="py-3 text-slate-800 font-medium">{item.name}</td>
                  <td className="py-3 text-slate-600">{item.start_date}</td>
                  <td className="py-3 text-slate-600">{item.end_date}</td>
                  <td className="py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        item.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleActive(item)}
                        className={`text-xs font-medium cursor-pointer ${
                          item.is_active ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'
                        }`}
                      >
                        {item.is_active ? 'Deactivate' : 'Set Active'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Belum ada tahun ajaran.
                  </td>
                </tr>
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
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                {editing ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran'}
              </h3>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="2026/2027"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Mulai</label>
                    <input
                      type="date"
                      value={form.start_date}
                      onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Selesai</label>
                    <input
                      type="date"
                      value={form.end_date}
                      onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors cursor-pointer"
                  >
                    {editing ? 'Simpan' : 'Tambah'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
