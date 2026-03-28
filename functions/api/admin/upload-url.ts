import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'
import { getUser } from '../../lib/auth'

// Usado apenas para upload de imagens (thumbnail) — pequenas o suficiente para passar pelo Worker
export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const user = await getUser(request as unknown as Request, env)
    if (!user?.is_admin) return json({ error: 'Unauthorized' }, 403)

    const { filename } = await request.json() as { filename: string; contentType?: string }
    if (!filename) return json({ error: 'filename obrigatório' }, 400)

    const key = `thumbnails/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`

    // Upload via Worker (sem CORS) para imagens pequenas
    const uploadUrl = `/api/admin/upload-direct?key=${encodeURIComponent(key)}`
    const publicUrl = `/videos/${key}`

    return json({ uploadUrl, publicUrl, key })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  }) as unknown as import('@cloudflare/workers-types').Response
}
