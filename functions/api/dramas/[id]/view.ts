import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../../lib/types'

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const onRequestPost: PagesFunction<Env> = async ({ params, env }) => {
  try {
    const id = params.id as string
    await env.DB.prepare('UPDATE dramas SET views = views + 1 WHERE id = ?').bind(id).run()
    const row = await env.DB.prepare('SELECT views FROM dramas WHERE id = ?').bind(id).first() as { views: number } | null
    return json({ views: row?.views ?? 0 })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}
