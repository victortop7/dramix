import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'
import { getUser } from '../../lib/auth'

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  }) as unknown as import('@cloudflare/workers-types').Response
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const admin = await getUser(request as unknown as Request, env)
    if (!admin?.is_admin) return json({ error: 'Unauthorized' }, 403)

    const { userId } = await (request as unknown as Request).json() as { userId: string }
    if (!userId) return json({ error: 'userId required' }, 400)

    // Define plano premium com validade em 2099 (vitalício)
    await env.DB.prepare(`
      UPDATE users
      SET plan = 'premium', plan_expires_at = '2099-12-31T23:59:59.000Z'
      WHERE id = ?
    `).bind(userId).run()

    return json({ success: true })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}
