import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../hooks/useAuth'
import AdminMasterNav from './AdminMasterNav'

interface Group {
  id: string
  name: string
  type: string
  academic_year_id: string
  mentor_id: string | null
  academic_years: { name: string } | null
}

export default function Groups() {
  const { user } = useAuth()
  const [items, setItems] = useState<Group[]>([])
  const [orgId, setOrgId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Group | null>(null)
  const [form, setForm] = useState({ name: '', type: 'REGULER', academic_year_id: '' })
  const [academicYears, setAcademicYears] = useState<{ id: string; name: string }[]>([])

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
          supabase.from('academic_years')
            .select('id, name')
            .eq('organization_id', data.organization_id)
            .order('start_date', { ascending: false })
            .then(({ data: ay }) => { if (ay) setAcademicYears(ay) })
        }
      })
  }, [user])

  async function load(oid: string) {
    const { data } = await supabase
      .from('groups')
      .select('*, academic_years!inner(name)')
      .eq('organization_id', oid)
      .order('type', { ascending: true })
    if (data) setItems(data as unknown as Group[])
  }

  function openCreate() {
    setEditing(null)
    setForm({ name: '', type: 'REGULER', academic_year_id: academicYears[0]?.id ?? '' })
    setShowModal(true)
  }

  function openEdit(item: Group) {
    setEditing(item)
    setForm({ name: item.name, type: item.type, academic_year_id: item.academic_year_id })
    setShowModal(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!orgId) return
    if (editing) {
      await supabase.from('groups').update({
        name: form.name,
        type: form.type,
        academic_year_id: form.academic_year_id,
      }).eq('id', editing.id)
    } else {
      await supabase.from('groups').insert({
        organization_id: orgId,
        name: form.name,
        type: form.type,
        academic_year_id: form.academic_year_id,
      })
    }
    setShowModal(false)
    load(orgId)
  }

  return (
    <div>
      <AdminMasterNav />
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Groups</h2>
          <button onClick={openCreate}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors cursor-pointer">+ Tambah</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-100">
                <th className="pb-3 font-medium">Nama</th>
                <th className="pb-3 font-medium">Tipe</th>
                <th className="pb-3 font-medium">Tahun Ajaran</th>
                <th className="pb-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="py-3 text-slate-800 font-medium">{item.name}</td>
                  <td className="py-3">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">{item.type}</span>
                  </td>
                  <td className="py-3 text-slate-600">{item.academic_years?.name || '-'}</td>
                  <td className="py-3">
                    <button onClick={() => openEdit(item)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer">Edit</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-slate-400">Belum ada grup.</td></tr>
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
              <h3 className="text-lg font-semibold text-slate-800 mb-4">{editing ? 'Edit Grup' : 'Tambah Grup'}</h3>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Grup</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="7A / Abu Bakar / Asrama Umar"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipe</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none">
                    <option value="REGULER">Reguler</option>
                    <option value="HALAQOH">Halaqoh</option>
                    <option value="ASRAMA">Asrama</option>
                    <option value="EKSKUL">Ekskul</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tahun Ajaran</label>
                  <select value={form.academic_year_id} onChange={(e) => setForm({ ...form, academic_year_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none" required>
                    <option value="">Pilih tahun ajaran...</option>
                    {academicYears.map((ay) => (
                      <option key={ay.id} value={ay.id}>{ay.name}</option>
                    ))}
                  </select>
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
