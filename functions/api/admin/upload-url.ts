import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'
import { getUser } from '../../lib/auth'
import { createPresignedPutUrl } from '../../lib/r2-presign'

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const user = await getUser(request as unknown as Request, env)
    if (!user?.is_admin) return json({ error: 'Unauthorized' }, 403)

    const { filename } = await request.json() as { filename: string; contentType: string }
    if (!filename) return json({ error: 'filename é obrigatório' }, 400)

    const key = `dramas/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`

    const uploadUrl = await createPresignedPutUrl({
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      endpoint: env.R2_ENDPOINT,
      bucket: env.R2_BUCKET,
      key,
    })

    // URL pública servida pelo Worker /videos/
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
