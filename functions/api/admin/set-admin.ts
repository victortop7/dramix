import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'
import { getUser } from '../../lib/auth'

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const requester = await getUser(request as unknown as Request, env)
    if (!requester || !requester.is_admin) {
      return json({ error: 'Não autorizado' }, 401)
    }

    const { userId, makeAdmin } = await request.json() as { userId: string; makeAdmin: boolean }
    if (!userId) return json({ error: 'userId obrigatório' }, 400)

    // Busca o admin principal (primeiro admin criado — protegido)
    const superAdmin = await env.DB.prepare(
      "SELECT id FROM users WHERE is_admin = 1 ORDER BY created_at ASC LIMIT 1"
    ).first() as { id: string } | null

    // Ninguém pode remover o admin principal
    if (!makeAdmin && superAdmin?.id === userId) {
      return json({ error: 'O admin principal não pode ser removido' }, 403)
    }

    // Não pode alterar a si mesmo
    if (requester.id === userId) {
      return json({ error: 'Você não pode alterar seu próprio status' }, 403)
    }

    await env.DB.prepare(
      'UPDATE users SET is_admin = ? WHERE id = ?'
    ).bind(makeAdmin ? 1 : 0, userId).run()

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
