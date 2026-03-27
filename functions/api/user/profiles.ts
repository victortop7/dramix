import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'
import { getUser } from '../../lib/auth'

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const user = await getUser(request, env)
    if (!user) return json({ error: 'Não autenticado' }, 401)

    const profiles = await env.DB.prepare(
      'SELECT * FROM profiles WHERE user_id = ? ORDER BY created_at ASC'
    ).bind(user.id).all()

    return json({
      profiles: (profiles.results as { id: string; user_id: string; name: string; avatar: string; created_at: string }[])
        .map(p => ({ id: p.id, userId: p.user_id, name: p.name, avatar: p.avatar, createdAt: p.created_at })),
    })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const user = await getUser(request, env)
    if (!user) return json({ error: 'Não autenticado' }, 401)

    const { name, avatar } = await request.json() as { name: string; avatar: string }
    if (!name) return json({ error: 'Nome obrigatório' }, 400)

    // Verificar limite de perfis
    const count = await env.DB.prepare('SELECT COUNT(*) as c FROM profiles WHERE user_id = ?').bind(user.id).first() as { c: number }
    const maxProfiles = user.plan === 'premium' ? 3 : 1
    if (count.c >= maxProfiles) return json({ error: `Seu plano permite no máximo ${maxProfiles} perfil(s)` }, 403)

    const id = crypto.randomUUID()
    await env.DB.prepare('INSERT INTO profiles (id, user_id, name, avatar) VALUES (?, ?, ?, ?)').bind(id, user.id, name, avatar ?? 'robot').run()

    return json({ profile: { id, userId: user.id, name, avatar: avatar ?? 'robot', createdAt: new Date().toISOString() } }, 201)
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  })
}
