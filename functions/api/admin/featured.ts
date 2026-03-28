import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'
import { getUser } from '../../lib/auth'

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const user = await getUser(request as unknown as Request, env)
    if (!user?.is_admin) return json({ error: 'Unauthorized' }, 403)
    const rows = await env.DB.prepare('SELECT id FROM dramas WHERE is_featured = 1').all()
    const featuredIds = ((rows.results ?? []) as { id: string }[]).map(r => r.id)
    return json({ featuredIds })
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

    const current = await env.DB.prepare('SELECT is_featured FROM dramas WHERE id = ?').bind(dramaId).first() as { is_featured: number } | null
    const newVal = current?.is_featured === 1 ? 0 : 1
    await env.DB.prepare('UPDATE dramas SET is_featured = ? WHERE id = ?').bind(newVal, dramaId).run()

    return json({ featured: newVal === 1 })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  }) as unknown as import('@cloudflare/workers-types').Response
}
