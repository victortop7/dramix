import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'
import { getUser } from '../../lib/auth'

// Recebe o arquivo via PUT e salva no R2
export const onRequestPut: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const user = await getUser(request as unknown as Request, env)
    if (!user?.is_admin) {
      return new Response('Unauthorized', { status: 403 }) as unknown as import('@cloudflare/workers-types').Response
    }

    const url = new URL(request.url)
    const key = url.searchParams.get('key')
    if (!key || !request.body) {
      return new Response('Missing key', { status: 400 }) as unknown as import('@cloudflare/workers-types').Response
    }

    const contentType = request.headers.get('Content-Type') ?? 'application/octet-stream'

    await env.VIDEOS.put(key, request.body, {
      httpMetadata: { contentType },
    })

    return new Response('{"ok":true}', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }) as unknown as import('@cloudflare/workers-types').Response
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }) as unknown as import('@cloudflare/workers-types').Response
  }
}
