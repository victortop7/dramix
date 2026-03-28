import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from './lib/types'

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const rows = await env.DB.prepare(
      'SELECT id, name, slug, sort_order FROM categories ORDER BY sort_order ASC'
    ).all()

    const categories = ((rows.results ?? []) as Record<string, unknown>[]).map(r => ({
      id: r.id, name: r.name, slug: r.slug, sortOrder: r.sort_order,
    }))

    return new Response(JSON.stringify({ categories }), {
      headers: { 'Content-Type': 'application/json' },
    }) as unknown as import('@cloudflare/workers-types').Response
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    }) as unknown as import('@cloudflare/workers-types').Response
  }
}
