import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'
import { hashPassword } from '../../lib/auth'

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  })
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const { token, newPassword } = await request.json() as { token: string; newPassword: string }
    if (!token || !newPassword) return json({ error: 'Dados inválidos' }, 400)
    if (newPassword.length < 6) return json({ error: 'Senha deve ter pelo menos 6 caracteres' }, 400)

    const user = await env.DB.prepare(
      'SELECT id, reset_token_expires FROM users WHERE reset_token = ?'
    ).bind(token).first() as { id: string; reset_token_expires: string } | null

    if (!user) return json({ error: 'Token inválido' }, 400)
    if (new Date(user.reset_token_expires) < new Date()) return json({ error: 'Token expirado. Solicite um novo reset.' }, 400)

    const hash = await hashPassword(newPassword)
    await env.DB.prepare(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?'
    ).bind(hash, user.id).run()

    return json({ success: true })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}
