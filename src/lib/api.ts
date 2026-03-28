const BASE = '/api'

function getToken(): string | null {
  return localStorage.getItem('dramix_token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  const data = await res.json() as { error?: string } & T

  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? 'Erro desconhecido')
  }
  return data
}

// Auth
export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: import('../types').User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (data: { name: string; email: string; whatsapp?: string; password: string }) =>
      request<{ token: string; user: import('../types').User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    me: () => request<{ user: import('../types').User }>('/auth/me'),
  },

  profiles: {
    list: () => request<{ profiles: import('../types').Profile[] }>('/user/profiles'),
    create: (name: string, avatar: string) =>
      request<{ profile: import('../types').Profile }>('/user/profiles', {
        method: 'POST',
        body: JSON.stringify({ name, avatar }),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/user/profiles/${id}`, { method: 'DELETE' }),
  },

  dramas: {
    featured: () => request<{ dramas: import('../types').FeaturedDrama[]; drama: import('../types').FeaturedDrama | null }>('/dramas/featured'),
    byCategory: (slug?: string) =>
      request<{ categories: import('../types').CategoryWithDramas[] }>(
        `/dramas/categories${slug ? `?slug=${slug}` : ''}`
      ),
    get: (id: string) => request<{ drama: import('../types').Drama }>(`/dramas/${id}`),
    search: (q: string) => request<{ dramas: import('../types').Drama[] }>(`/dramas/search?q=${encodeURIComponent(q)}`),
    incrementView: (id: string) =>
      request<{ views: number }>(`/dramas/${id}/view`, { method: 'POST' }),
  },

  list: {
    get: (profileId: string) =>
      request<{ dramas: import('../types').Drama[] }>(`/user/list?profileId=${profileId}`),
    add: (profileId: string, dramaId: string) =>
      request<{ success: boolean }>('/user/list', {
        method: 'POST',
        body: JSON.stringify({ profileId, dramaId }),
      }),
    remove: (profileId: string, dramaId: string) =>
      request<{ success: boolean }>(`/user/list/${dramaId}?profileId=${profileId}`, {
        method: 'DELETE',
      }),
  },

  history: {
    save: (profileId: string, dramaId: string, progressSeconds: number) =>
      request<{ success: boolean }>('/user/history', {
        method: 'POST',
        body: JSON.stringify({ profileId, dramaId, progressSeconds }),
      }),
  },

  admin: {
    createDrama: (data: Record<string, unknown>) =>
      request<{ drama: import('../types').Drama }>('/admin/dramas', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateDrama: (id: string, data: Partial<import('../types').Drama>) =>
      request(`/admin/dramas/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteDrama: (id: string) =>
      request(`/admin/dramas/${id}`, { method: 'DELETE' }),
    getFeatured: () =>
      request<{ featuredIds: string[] }>('/admin/featured'),
    setFeatured: (dramaId: string) =>
      request('/admin/featured', { method: 'POST', body: JSON.stringify({ dramaId }) }),
    getUploadUrl: (filename: string, contentType: string) =>
      request<{ uploadUrl: string; publicUrl: string }>('/admin/upload-url', {
        method: 'POST',
        body: JSON.stringify({ filename, contentType }),
      }),
    startUpload: (filename: string) =>
      request<{ uploadId: string; key: string; publicUrl: string }>('/admin/upload-start', {
        method: 'POST',
        body: JSON.stringify({ filename }),
      }),
    uploadChunk: (key: string, uploadId: string, partNumber: number, chunk: Blob) => {
      const token = getToken()
      return fetch(`${BASE}/admin/upload-chunk?key=${encodeURIComponent(key)}&uploadId=${encodeURIComponent(uploadId)}&partNumber=${partNumber}`, {
        method: 'POST',
        body: chunk,
        headers: { 'Authorization': `Bearer ${token ?? ''}`, 'Content-Type': 'application/octet-stream' },
      }).then(r => r.json()) as Promise<{ etag: string; partNumber: number }>
    },
    completeUpload: (key: string, uploadId: string, parts: Array<{ partNumber: number; etag: string }>) =>
      request<{ success: boolean }>('/admin/upload-complete', {
        method: 'POST',
        body: JSON.stringify({ key, uploadId, parts }),
      }),
    listDramas: () => request<{ dramas: import('../types').Drama[] }>('/admin/dramas'),
  },

  subscription: {
    createPix: (plan: 'basic' | 'premium', cpf: string) =>
      request<{ paymentId: string; pixCode: string; pixQrCode: string }>('/subscription/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan, cpf }),
      }),
  },
}
