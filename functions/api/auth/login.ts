import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'
import { verifyPassword, createToken } from '../../lib/auth'

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { email, password } = await request.json() as { email: string; password: string }
    if (!email || !password) return json({ error: 'Email e senha são obrigatórios' }, 400)

    const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email.toLowerCase()).first() as {
      id: string; name: string; email: string; password_hash: string; plan: string; is_admin: number; plan_expires_at: string | null
    } | null

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return json({ error: 'Email ou senha incorretos' }, 401)
    }

    const token = await createToken(user.id, env.JWT_SECRET)
    return json({
      token,
      user: {
        id: user.id, name: user.name, email: user.email,
        plan: user.plan, planExpiresAt: user.plan_expires_at,
        isAdmin: user.is_admin === 1,
      },
    })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
