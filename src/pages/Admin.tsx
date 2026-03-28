import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Star, Upload, X, Check } from 'lucide-react'
import Navbar from '../components/Navbar'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { formatViews, formatDuration } from '../lib/format'
import type { Drama, Category } from '../types'

interface DramaForm {
  title: string
  description: string
  isDubbed: boolean
  isNew: boolean
  isExclusive: boolean
  categoryIds: string[]
  thumbnailFile: File | null
  videoFile: File | null
  thumbnailUrl: string
  videoUrl: string
}

const EMPTY_FORM: DramaForm = {
  title: '', description: '', isDubbed: false, isNew: true, isExclusive: false,
  categoryIds: [], thumbnailFile: null, videoFile: null, thumbnailUrl: '', videoUrl: '',
}

export default function Admin() {
  const { user, isAdmin, isLoading } = useAuth()
  const navigate = useNavigate()
  const [dramas, setDramas] = useState<Drama[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredIds, setFeaturedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<DramaForm>(EMPTY_FORM)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [catPopover, setCatPopover] = useState<string | null>(null)
  const [selectedCat, setSelectedCat] = useState<string | null>(null)
  const thumbInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isLoading) return
    if (!user || !isAdmin()) { navigate('/home'); return }
    Promise.all([
      api.admin.listDramas(),
      api.dramas.byCategory(),
      api.admin.getFeatured(),
    ]).then(([{ dramas: d }, { categories: cats }, { featuredIds: ids }]) => {
      setDramas(d)
      setFeaturedIds(ids)
      const allCats: Category[] = []
      cats.forEach(c => { if (!allCats.find(x => x.id === c.id)) allCats.push({ id: c.id, name: c.name, slug: c.slug, sortOrder: c.sortOrder }) })
      setCategories(allCats)
    }).finally(() => setLoading(false))
  }, [user, isAdmin, isLoading, navigate])

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true) }
  const openEdit = (d: Drama) => {
    setForm({
      title: d.title, description: d.description ?? '', isDubbed: d.isDubbed,
      isNew: d.isNew, isExclusive: d.isExclusive,
      categoryIds: d.categories.map(c => c.id),
      thumbnailFile: null, videoFile: null,
      thumbnailUrl: d.thumbnailUrl ?? '', videoUrl: d.videoUrl ?? '',
    })
    setEditId(d.id)
    setShowForm(true)
  }

  const uploadFile = async (file: File, type: 'thumbnail' | 'video'): Promise<string> => {
    if (type === 'thumbnail') {
      // Imagem pequena — upload direto pelo Worker
      setUploadProgress('Fazendo upload de capa...')
      const { uploadUrl, publicUrl } = await api.admin.getUploadUrl(file.name, file.type)
      const token = localStorage.getItem('dramix_token') ?? ''
      const res = await fetch(uploadUrl, {
        method: 'PUT', body: file,
        headers: { 'Content-Type': file.type, 'Authorization': `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`Erro no upload da capa: ${res.status}`)
      setUploadProgress('')
      return publicUrl
    }

    // Vídeo grande — upload em chunks via multipart R2
    const CHUNK = 50 * 1024 * 1024 // 50MB por chunk
    const { uploadId, key, publicUrl } = await api.admin.startUpload(file.name)
    const total = Math.ceil(file.size / CHUNK)
    const parts: Array<{ partNumber: number; etag: string }> = []

    for (let i = 0; i < total; i++) {
      const chunk = file.slice(i * CHUNK, Math.min((i + 1) * CHUNK, file.size))
      const pct = Math.round(((i + 1) / total) * 100)
      setUploadProgress(`Enviando vídeo... ${pct}% (${i + 1}/${total})`)
      const part = await api.admin.uploadChunk(key, uploadId, i + 1, chunk)
      parts.push({ partNumber: part.partNumber, etag: part.etag })
    }

    setUploadProgress('Finalizando upload...')
    await api.admin.completeUpload(key, uploadId, parts)
    setUploadProgress('')
    return publicUrl
  }

  const handleSave = async () => {
    if (!form.title.trim()) { alert('Título obrigatório'); return }
    setSaving(true)
    try {
      let thumbUrl = form.thumbnailUrl
      let videoUrl = form.videoUrl

      if (form.thumbnailFile) thumbUrl = await uploadFile(form.thumbnailFile, 'thumbnail')
      if (form.videoFile) videoUrl = await uploadFile(form.videoFile, 'video')

      const payload = {
        title: form.title,
        description: form.description,
        isDubbed: form.isDubbed,
        isNew: form.isNew,
        isExclusive: form.isExclusive,
        categoryIds: form.categoryIds,
        thumbnailUrl: thumbUrl,
        videoUrl: videoUrl,
      }

      if (editId) {
        await api.admin.updateDrama(editId, payload)
        setDramas(v => v.map(d => d.id === editId ? { ...d, ...payload, categories: categories.filter(c => form.categoryIds.includes(c.id)) } : d))
      } else {
        const result = await api.admin.createDrama(payload as unknown as Record<string, unknown>)
        setDramas(v => [result.drama, ...v])
      }
      setShowForm(false)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
      setUploadProgress('')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este drama?')) return
    await api.admin.deleteDrama(id)
    setDramas(v => v.filter(d => d.id !== id))
  }

  const setFeatured = async (id: string) => {
    await api.admin.setFeatured(id)
    setFeaturedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleCategory = (id: string) => {
    setForm(v => ({
      ...v,
      categoryIds: v.categoryIds.includes(id)
        ? v.categoryIds.filter(c => c !== id)
        : [...v.categoryIds, id],
    }))
  }

  const bulkAddCategory = async (catId: string) => {
    const toUpdate = dramas.filter(d => !d.categories.some(c => c.id === catId))
    await Promise.all(toUpdate.map(d => {
      const newIds = [...d.categories.map(c => c.id), catId]
      return api.admin.updateDrama(d.id, { categoryIds: newIds } as never)
    }))
    const cat = categories.find(c => c.id === catId)
    if (cat) {
      setDramas(v => v.map(d => d.categories.some(c => c.id === catId)
        ? d
        : { ...d, categories: [...d.categories, cat] }
      ))
    }
  }

  const toggleDramaCategory = async (dramaId: string, catId: string, hasIt: boolean) => {
    const drama = dramas.find(d => d.id === dramaId)
    if (!drama) return
    const newCatIds = hasIt
      ? drama.categories.filter(c => c.id !== catId).map(c => c.id)
      : [...drama.categories.map(c => c.id), catId]
    await api.admin.updateDrama(dramaId, { categoryIds: newCatIds } as never)
    setDramas(v => v.map(d => d.id === dramaId
      ? { ...d, categories: categories.filter(c => newCatIds.includes(c.id)) }
      : d
    ))
  }

  if (loading) return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: 'calc(var(--navbar-h) + 32px)' }} className="px-8">
        <div className="skeleton h-8 w-48 rounded mb-8" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: 'calc(var(--navbar-h) + 32px)' }} className="px-4 md:px-8 pb-16">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 fade-up">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Painel Admin</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{dramas.length} dramas cadastrados</p>
          </div>
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> Novo Drama
          </button>
        </div>

        {/* Barra de categorias */}
        {categories.length > 0 && (
          <div className="mb-4 fade-up">
            <div className="flex flex-wrap gap-2 items-center">
              {categories.map(c => (
                <button key={c.id}
                  onClick={() => setSelectedCat(selectedCat === c.id ? null : c.id)}
                  className="text-xs px-3 py-1.5 rounded-full transition-all"
                  style={{
                    background: selectedCat === c.id ? 'var(--accent-dim)' : 'var(--surface)',
                    border: selectedCat === c.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                    color: selectedCat === c.id ? 'var(--accent-light)' : 'var(--text-dim)',
                    cursor: 'pointer',
                  }}>
                  {c.name}
                </button>
              ))}
              {selectedCat && (
                <button
                  onClick={() => { void bulkAddCategory(selectedCat); setSelectedCat(null) }}
                  className="text-xs px-3 py-1.5 rounded-full transition-all"
                  style={{ background: 'var(--green-dim)', border: '1px solid var(--green)', color: 'var(--green)', cursor: 'pointer' }}>
                  ✓ Adicionar a todos
                </button>
              )}
            </div>
            {selectedCat && (
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                Clique em "Adicionar a todos" para atribuir <strong style={{ color: 'var(--text-dim)' }}>{categories.find(c => c.id === selectedCat)?.name}</strong> a todos os dramas de uma vez
              </p>
            )}
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl overflow-hidden fade-up"
          style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Drama', 'Categorias', 'Views', 'Duração', 'Badges', 'Ações'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase"
                    style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dramas.map(d => (
                <tr key={d.id}
                  style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-alt)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {d.thumbnailUrl && (
                        <img src={d.thumbnailUrl} alt="" className="w-10 h-14 object-cover rounded-lg flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium line-clamp-2" style={{ color: 'var(--text)', maxWidth: 200 }}>
                        {d.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ position: 'relative' }}>
                    <div className="flex flex-wrap gap-1 cursor-pointer" onClick={() => setCatPopover(catPopover === d.id ? null : d.id)}>
                      {d.categories.length === 0 && (
                        <span className="text-xs px-2 py-0.5 rounded border border-dashed"
                          style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>+ categoria</span>
                      )}
                      {d.categories.map(c => (
                        <span key={c.id} className="text-xs px-2 py-0.5 rounded"
                          style={{ background: 'var(--accent-dim)', color: 'var(--accent-light)', border: '1px solid var(--accent)' }}>
                          {c.name}
                        </span>
                      ))}
                    </div>
                    {catPopover === d.id && (
                      <div className="absolute z-50 mt-2 p-3 rounded-xl flex flex-wrap gap-1.5"
                        style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', minWidth: 260, left: 0, top: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                        {categories.map(c => {
                          const has = d.categories.some(dc => dc.id === c.id)
                          return (
                            <button key={c.id}
                              onClick={e => { e.stopPropagation(); void toggleDramaCategory(d.id, c.id, has) }}
                              className="text-xs px-2.5 py-1 rounded-full transition-all"
                              style={{
                                background: has ? 'var(--accent-dim)' : 'var(--surface)',
                                border: has ? '1px solid var(--accent)' : '1px solid var(--border)',
                                color: has ? 'var(--accent-light)' : 'var(--text-dim)',
                                cursor: 'pointer',
                              }}>
                              {has ? '✓ ' : ''}{c.name}
                            </button>
                          )
                        })}
                        <button onClick={e => { e.stopPropagation(); setCatPopover(null) }}
                          className="text-xs px-2 py-1 rounded-full w-full mt-1"
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                          Fechar
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>
                    {formatViews(d.views)}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
                    {d.durationSeconds ? formatDuration(d.durationSeconds) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {d.isDubbed && <span className="badge badge-red" style={{ fontSize: 9 }}>DUB</span>}
                      {d.isNew && <span className="badge badge-green" style={{ fontSize: 9 }}>Novo</span>}
                      {d.isExclusive && <span className="badge badge-amber" style={{ fontSize: 9 }}>Exc</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => void setFeatured(d.id)} title="Definir como destaque"
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--amber)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                        <Star size={14} fill={featuredIds.includes(d.id) ? 'var(--amber)' : 'none'} />
                      </button>
                      <button onClick={() => openEdit(d)}
                        className="p-1.5 rounded-lg"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => void handleDelete(d.id)}
                        className="p-1.5 rounded-lg"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {dramas.length === 0 && (
            <div className="py-16 text-center" style={{ color: 'var(--text-muted)' }}>
              Nenhum drama cadastrado ainda.
            </div>
          )}
        </div>
      </div>

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
          style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="w-full max-w-xl my-8 rounded-2xl p-6 fade-up"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                {editId ? 'Editar Drama' : 'Novo Drama'}
              </h2>
              <button onClick={() => setShowForm(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-dim)' }}>Título *</label>
                <input className="input" placeholder="Título do drama" value={form.title}
                  onChange={e => setForm(v => ({ ...v, title: e.target.value }))} />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-dim)' }}>Sinopse</label>
                <textarea className="input" placeholder="Descrição do drama..." rows={3}
                  value={form.description}
                  onChange={e => setForm(v => ({ ...v, description: e.target.value }))}
                  style={{ resize: 'vertical', fontFamily: 'var(--sans)' }} />
              </div>

              {/* Thumbnail */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-dim)' }}>Capa (thumbnail)</label>
                <input className="input" placeholder="URL da capa (ou selecione arquivo abaixo)"
                  value={form.thumbnailUrl}
                  onChange={e => setForm(v => ({ ...v, thumbnailUrl: e.target.value }))} />
                <input ref={thumbInputRef} type="file" accept="image/*" className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) setForm(v => ({ ...v, thumbnailFile: f, thumbnailUrl: '' }))
                  }} />
                <button className="mt-2 text-sm flex items-center gap-1.5"
                  style={{ background: 'none', border: 'none', color: 'var(--accent-light)', cursor: 'pointer' }}
                  onClick={() => thumbInputRef.current?.click()}>
                  <Upload size={13} />
                  {form.thumbnailFile ? form.thumbnailFile.name : 'Selecionar arquivo de imagem'}
                </button>
              </div>

              {/* Video */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-dim)' }}>Vídeo (Cloudflare R2)</label>
                <input className="input" placeholder="URL do vídeo no R2 (ou selecione arquivo)"
                  value={form.videoUrl}
                  onChange={e => setForm(v => ({ ...v, videoUrl: e.target.value }))} />
                <input ref={videoInputRef} type="file" accept="video/*" className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) setForm(v => ({ ...v, videoFile: f, videoUrl: '' }))
                  }} />
                <button className="mt-2 text-sm flex items-center gap-1.5"
                  style={{ background: 'none', border: 'none', color: 'var(--accent-light)', cursor: 'pointer' }}
                  onClick={() => videoInputRef.current?.click()}>
                  <Upload size={13} />
                  {form.videoFile ? form.videoFile.name : 'Selecionar arquivo de vídeo'}
                </button>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dim)' }}>Categorias</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(c => (
                    <button key={c.id}
                      onClick={() => toggleCategory(c.id)}
                      className="text-xs px-3 py-1.5 rounded-full transition-all"
                      style={{
                        background: form.categoryIds.includes(c.id) ? 'var(--accent-dim)' : 'var(--surface-alt)',
                        border: form.categoryIds.includes(c.id) ? '1px solid var(--accent)' : '1px solid var(--border)',
                        color: form.categoryIds.includes(c.id) ? 'var(--accent-light)' : 'var(--text-dim)',
                        cursor: 'pointer',
                      }}>
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flags */}
              <div className="flex flex-wrap gap-4">
                {[
                  { key: 'isDubbed', label: 'Dublado' },
                  { key: 'isNew', label: 'Novo' },
                  { key: 'isExclusive', label: 'Exclusivo' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox"
                      checked={form[key as keyof DramaForm] as boolean}
                      onChange={e => setForm(v => ({ ...v, [key]: e.target.checked }))}
                      style={{ accentColor: 'var(--accent)', width: 16, height: 16 }} />
                    <span className="text-sm" style={{ color: 'var(--text-dim)' }}>{label}</span>
                  </label>
                ))}
              </div>

              {/* Upload progress */}
              {uploadProgress && (
                <p className="text-sm text-center" style={{ color: 'var(--accent-light)' }}>
                  ⏳ {uploadProgress}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-2">
                <button className="btn-secondary flex-1" onClick={() => setShowForm(false)}>Cancelar</button>
                <button className="btn-primary flex-1 justify-center" onClick={() => void handleSave()} disabled={saving}>
                  <Check size={15} />
                  {saving ? 'Salvando...' : editId ? 'Salvar Alterações' : 'Criar Drama'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
