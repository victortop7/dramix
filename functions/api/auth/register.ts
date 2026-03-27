import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'
import { hashPassword, createToken } from '../../lib/auth'

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { name, email, whatsapp, password } = await request.json() as {
      name: string; email: string; whatsapp?: string; password: string
    }

    if (!name || !email || !password) return json({ error: 'Nome, email e senha são obrigatórios' }, 400)
    if (password.length < 6) return json({ error: 'Senha deve ter pelo menos 6 caracteres' }, 400)

    const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email.toLowerCase()).first()
    if (existing) return json({ error: 'Este email já está cadastrado' }, 409)

    const id = crypto.randomUUID()
    const hash = await hashPassword(password)

    await env.DB.prepare(
      'INSERT INTO users (id, name, email, whatsapp, password_hash) VALUES (?, ?, ?, ?, ?)'
    ).bind(id, name.trim(), email.toLowerCase(), whatsapp ?? null, hash).run()

    // Criar perfil padrão
    const profileId = crypto.randomUUID()
    await env.DB.prepare(
      'INSERT INTO profiles (id, user_id, name, avatar) VALUES (?, ?, ?, ?)'
    ).bind(profileId, id, name.trim(), 'robot').run()

    const token = await createToken(id, env.JWT_SECRET)
    return json({ token, user: { id, name: name.trim(), email: email.toLowerCase(), plan: 'free', isAdmin: false } })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  })
}
