import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../hooks/useAuth'
import AdminMasterNav from './AdminMasterNav'

interface Student {
  id: string
  nama: string
  nisn: string | null
  gender: string | null
  birth_date: string | null
  status: string
}

interface GroupInfo {
  id: string
  name: string
  type: string
}

export default function Students() {
  const { user } = useAuth()
  const [items, setItems] = useState<Student[]>([])
  const [orgId, setOrgId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const [form, setForm] = useState({ nama: '', nisn: '', gender: 'L', birth_date: '' })
  const [groupAssign, setGroupAssign] = useState<Record<string, boolean>>({})
  const [availableGroups, setAvailableGroups] = useState<GroupInfo[]>([])
  const [activeAY, setActiveAY] = useState<string | null>(null)

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
      .from('students')
      .select('*')
      .eq('organization_id', oid)
      .order('created_at', { ascending: false })
    if (data) setItems(data)
  }

  async function loadGroups(oid: string) {
    const { data: ay } = await supabase
      .from('academic_years')
      .select('id')
      .eq('organization_id', oid)
      .eq('is_active', true)
      .single()
    if (ay) {
      setActiveAY(ay.id)
      const { data: g } = await supabase
        .from('groups')
        .select('id, name, type')
        .eq('organization_id', oid)
        .eq('academic_year_id', ay.id)
      if (g) setAvailableGroups(g)
    }
  }

  function openCreate() {
    setEditing(null)
    setForm({ nama: '', nisn: '', gender: 'L', birth_date: '' })
    setGroupAssign({})
    if (orgId) loadGroups(orgId)
    setShowModal(true)
  }

  async function openEdit(item: Student) {
    setEditing(item)
    setForm({
      nama: item.nama,
      nisn: item.nisn ?? '',
      gender: item.gender ?? 'L',
      birth_date: item.birth_date ?? '',
    })
    if (orgId) {
      await loadGroups(orgId)
      if (activeAY) {
        const { data: sgs } = await supabase
          .from('student_groups')
          .select('group_id')
          .eq('student_id', item.id)
          .eq('academic_year_id', activeAY)
          .eq('active', true)
        const map: Record<string, boolean> = {}
        sgs?.forEach((sg) => { map[sg.group_id] = true })
        setGroupAssign(map)
      }
    }
    setShowModal(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!orgId) return
    let studentId = editing?.id

    if (editing) {
      await supabase.from('students').update({
        nama: form.nama,
        nisn: form.nisn || null,
        gender: form.gender || null,
        birth_date: form.birth_date || null,
      }).eq('id', editing.id)
    } else {
      const { data } = await supabase.from('students').insert({
        organization_id: orgId,
        nama: form.nama,
        nisn: form.nisn || null,
        gender: form.gender || null,
        birth_date: form.birth_date || null,
      }).select('id').single()
      studentId = data?.id
    }

    if (studentId && activeAY) {
      const { data: existing } = await supabase
        .from('student_groups')
        .select('group_id')
        .eq('student_id', studentId)
        .eq('academic_year_id', activeAY)
        .eq('active', true)

      const existingIds = new Set(existing?.map((e) => e.group_id) ?? [])

      for (const gid of Object.keys(groupAssign)) {
        if (groupAssign[gid] && !existingIds.has(gid)) {
          await supabase.from('student_groups').insert({
            student_id: studentId,
            group_id: gid,
            academic_year_id: activeAY,
          })
        }
        if (!groupAssign[gid] && existingIds.has(gid)) {
          await supabase.from('student_groups')
            .update({ active: false, end_date: new Date().toISOString().split('T')[0] })
            .eq('student_id', studentId)
            .eq('group_id', gid)
            .eq('academic_year_id', activeAY)
        }
      }
    }

    setShowModal(false)
    if (orgId) load(orgId)
  }

  async function updateStatus(item: Student, status: string) {
    await supabase.from('students').update({ status }).eq('id', item.id)
    if (orgId) load(orgId)
  }

  return (
    <div>
      <AdminMasterNav />
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Students</h2>
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
                <th className="pb-3 font-medium">Nama</th>
                <th className="pb-3 font-medium">NISN</th>
                <th className="pb-3 font-medium">Gender</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="py-3 text-slate-800 font-medium">{item.nama}</td>
                  <td className="py-3 text-slate-600">{item.nisn || '-'}</td>
                  <td className="py-3 text-slate-600">{item.gender === 'L' ? 'Laki-laki' : item.gender === 'P' ? 'Perempuan' : '-'}</td>
                  <td className="py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      item.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      item.status === 'GRADUATED' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(item)} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer">Edit</button>
                      {item.status === 'ACTIVE' && (
                        <button onClick={() => updateStatus(item, 'GRADUATED')} className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer">Graduate</button>
                      )}
                      {item.status === 'ACTIVE' && (
                        <button onClick={() => updateStatus(item, 'MOVED')} className="text-xs text-yellow-600 hover:text-yellow-800 font-medium cursor-pointer">Move</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-slate-400">Belum ada siswa.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">{editing ? 'Edit Siswa' : 'Tambah Siswa'}</h3>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                  <input type="text" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">NISN</label>
                    <input type="text" value={form.nisn} onChange={(e) => setForm({ ...form, nisn: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                    <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none">
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Lahir</label>
                  <input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none" />
                </div>

                {availableGroups.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Group Assignment</label>
                    <div className="space-y-2">
                      {availableGroups.map((g) => (
                        <label key={g.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!groupAssign[g.id]}
                            onChange={(e) => setGroupAssign({ ...groupAssign, [g.id]: e.target.checked })}
                            className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                          />
                          <div>
                            <span className="text-sm font-medium text-slate-800">{g.name}</span>
                            <span className="text-xs text-slate-400 ml-2">{g.type}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

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
