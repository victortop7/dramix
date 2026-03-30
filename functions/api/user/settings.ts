import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'
import { getUser, hashPassword, verifyPassword } from '../../lib/auth'

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  })
}

// PATCH /api/user/settings — atualiza nome ou senha
export const onRequestPatch: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const user = await getUser(request, env)
    if (!user) return json({ error: 'Não autenticado' }, 401)

    const data = await request.json() as Record<string, unknown>
    const { name, currentPassword, newPassword } = data

    // Atualizar nome
    if (name && typeof name === 'string' && name.trim()) {
      await env.DB.prepare('UPDATE users SET name = ? WHERE id = ?')
        .bind(name.trim(), user.id).run()
    }

    // Atualizar senha
    if (newPassword && typeof newPassword === 'string') {
      if (!currentPassword || typeof currentPassword !== 'string') {
        return json({ error: 'Senha atual é obrigatória' }, 400)
      }
      const valid = await verifyPassword(currentPassword, user.password_hash)
      if (!valid) return json({ error: 'Senha atual incorreta' }, 400)
      if ((newPassword as string).length < 6) return json({ error: 'Nova senha deve ter pelo menos 6 caracteres' }, 400)
      const hash = await hashPassword(newPassword)
      await env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
        .bind(hash, user.id).run()
    }

    return json({ success: true })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}
