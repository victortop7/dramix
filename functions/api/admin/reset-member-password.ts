import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'
import { getUser, hashPassword } from '../../lib/auth'

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  }) as unknown as import('@cloudflare/workers-types').Response
}

// POST /api/admin/reset-member-password — admin reseta senha de um membro
export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const admin = await getUser(request as unknown as Request, env)
    if (!admin?.is_admin) return json({ error: 'Unauthorized' }, 403)

    const { userId, newPassword } = await request.json() as { userId: string; newPassword: string }
    if (!userId || !newPassword) return json({ error: 'Dados inválidos' }, 400)
    if (newPassword.length < 6) return json({ error: 'Senha deve ter pelo menos 6 caracteres' }, 400)

    const hash = await hashPassword(newPassword)
    await env.DB.prepare(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?'
    ).bind(hash, userId).run()

    return json({ success: true })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}
