import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'
import { getUser } from '../../lib/auth'

// POST /api/user/free-time — persiste free_seconds_used diretamente
export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const user = await getUser(request as unknown as Request, env)
    if (!user) return json({ error: 'Unauthorized' }, 401)
    if (user.plan !== 'free') return json({ success: true }) // plano pago, ignora

    const { seconds } = await request.json() as { seconds: number }
    if (typeof seconds !== 'number') return json({ error: 'seconds inválido' }, 400)

    const clamped = Math.min(Math.max(0, Math.floor(seconds)), 1800)
    await env.DB.prepare(
      'UPDATE users SET free_seconds_used = MAX(free_seconds_used, ?) WHERE id = ?'
    ).bind(clamped, user.id).run()

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
