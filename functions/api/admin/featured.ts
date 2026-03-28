import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'
import { getUser } from '../../lib/auth'

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const user = await getUser(request as unknown as Request, env)
    if (!user?.is_admin) return json({ error: 'Unauthorized' }, 403)
    const row = await env.DB.prepare('SELECT drama_id FROM featured_drama WHERE id = 1').first() as { drama_id: string } | null
    return json({ dramaId: row?.drama_id ?? null })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const user = await getUser(request as unknown as Request, env)
    if (!user?.is_admin) return json({ error: 'Unauthorized' }, 403)

    const { dramaId } = await request.json() as { dramaId: string }
    if (!dramaId) return json({ error: 'dramaId é obrigatório' }, 400)

    await env.DB.prepare(`
      INSERT OR REPLACE INTO featured_drama (id, drama_id, updated_at)
      VALUES (1, ?, datetime('now'))
    `).bind(dramaId).run()

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
