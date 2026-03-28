import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../lib/types'

export const onRequestGet: PagesFunction<Env> = async ({ env, params, request }) => {
  const pathParts = params.path as string | string[]
  const key = Array.isArray(pathParts) ? pathParts.join('/') : pathParts

  const rangeHeader = request.headers.get('Range')

  // Busca com suporte a range nativo do R2
  const object = await env.VIDEOS.get(key, rangeHeader ? { range: request.headers } : undefined)
  if (!object) {
    return new Response('Not Found', { status: 404 }) as unknown as import('@cloudflare/workers-types').Response
  }

  const contentType = object.httpMetadata?.contentType ?? 'video/mp4'
  const headers = new Headers()
  headers.set('Content-Type', contentType)
  headers.set('Cache-Control', 'public, max-age=86400')
  headers.set('Accept-Ranges', 'bytes')

  if (rangeHeader && object.range) {
    const range = object.range as { offset: number; length: number }
    const start = range.offset
    const end = range.offset + range.length - 1
    headers.set('Content-Range', `bytes ${start}-${end}/${object.size}`)
    headers.set('Content-Length', String(range.length))
    return new Response(object.body, { status: 206, headers }) as unknown as import('@cloudflare/workers-types').Response
  }

  headers.set('Content-Length', String(object.size))
  return new Response(object.body, { status: 200, headers }) as unknown as import('@cloudflare/workers-types').Response
}
