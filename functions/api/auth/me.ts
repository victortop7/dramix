import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'
import { getUser } from '../../lib/auth'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const user = await getUser(request as unknown as Request, env)
    if (!user) return json({ error: 'Não autenticado' }, 401)

    // Se plano pago venceu → rebaixa para free automaticamente
    let plan = user.plan
    if ((plan === 'basic' || plan === 'premium') && user.plan_expires_at) {
      const expired = new Date(user.plan_expires_at) < new Date()
      if (expired) {
        await env.DB.prepare("UPDATE users SET plan = 'free', plan_expires_at = NULL WHERE id = ?")
          .bind(user.id).run()
        plan = 'free'
      }
    }

    return json({
      user: {
        id: user.id, name: user.name, email: user.email,
        plan, isAdmin: user.is_admin === 1,
        freeSecondsUsed: user.free_seconds_used ?? 0,
        planExpiresAt: plan !== 'free' ? user.plan_expires_at : null,
      },
    })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  })
}
