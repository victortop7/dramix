import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'
import { getUser } from '../../lib/auth'

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const user = await getUser(request as unknown as Request, env)
    if (!user?.is_admin) return json({ error: 'Unauthorized' }, 403)

    const { key, uploadId, parts } = await request.json() as {
      key: string
      uploadId: string
      parts: Array<{ partNumber: number; etag: string }>
    }

    if (!key || !uploadId || !parts) return json({ error: 'Params inválidos' }, 400)

    const multipart = env.VIDEOS.resumeMultipartUpload(key, uploadId)
    await multipart.complete(parts)

    return json({ success: true })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  }) as unknown as import('@cloudflare/workers-types').Response
}
