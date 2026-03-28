import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'
import { getUser } from '../../lib/auth'

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const user = await getUser(request as unknown as Request, env)
    if (!user?.is_admin) return json({ error: 'Unauthorized' }, 403)

    const url = new URL(request.url)
    const key = url.searchParams.get('key')
    const uploadId = url.searchParams.get('uploadId')
    const partNumber = parseInt(url.searchParams.get('partNumber') ?? '1')

    if (!key || !uploadId || !request.body) return json({ error: 'Params inválidos' }, 400)

    const multipart = env.VIDEOS.resumeMultipartUpload(key, uploadId)
    const part = await multipart.uploadPart(partNumber, request.body)

    return json({ etag: part.etag, partNumber })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  }) as unknown as import('@cloudflare/workers-types').Response
}
