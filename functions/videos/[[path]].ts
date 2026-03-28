import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../lib/types'

export const onRequestGet: PagesFunction<Env> = async ({ env, params, request }) => {
  const pathParts = params.path as string | string[]
  const key = Array.isArray(pathParts) ? pathParts.join('/') : pathParts

  const object = await env.VIDEOS.get(key)
  if (!object) {
    return new Response('Not Found', { status: 404 }) as unknown as import('@cloudflare/workers-types').Response
  }

  const headers = new Headers()
  headers.set('Content-Type', object.httpMetadata?.contentType ?? 'video/mp4')
  headers.set('Cache-Control', 'public, max-age=86400')
  headers.set('Accept-Ranges', 'bytes')

  // Suporte a range requests (necessário para o player de vídeo)
  const rangeHeader = request.headers.get('Range')
  if (rangeHeader) {
    headers.set('Content-Range', `bytes */${object.size}`)
  }

  return new Response(object.body, {
    status: 200,
    headers,
  }) as unknown as import('@cloudflare/workers-types').Response
}
