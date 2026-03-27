import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'
import { getUser } from '../../lib/auth'

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const user = await getUser(request, env)
    if (!user?.is_admin) return json({ error: 'Unauthorized' }, 403)

    const { filename, contentType } = await request.json() as { filename: string; contentType: string }
    if (!filename || !contentType) return json({ error: 'filename e contentType são obrigatórios' }, 400)

    const key = `dramas/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`

    // Gerar URL de upload presignada no R2
    // Nota: Cloudflare R2 suporta upload direto via PUT com URL presignada
    // Para URL presignada, use o SDK aws-compatible ou wrangler
    // Aqui retornamos a URL para upload direto via Workers
    const uploadUrl = `/api/admin/upload-direct?key=${encodeURIComponent(key)}&token=${encodeURIComponent(await getUser(request, env).then(() => 'ok'))}`
    const publicUrl = `https://pub-SEUBUCKETID.r2.dev/${key}`

    return json({ uploadUrl, publicUrl, key })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  })
}
