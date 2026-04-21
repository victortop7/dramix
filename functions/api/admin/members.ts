import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'
import { getUser } from '../../lib/auth'

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  }) as unknown as import('@cloudflare/workers-types').Response
}

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const user = await getUser(request as unknown as Request, env)
    if (!user?.is_admin) return json({ error: 'Unauthorized' }, 403)

    const rows = await env.DB.prepare(`
      SELECT
        u.id, u.name, u.email, u.whatsapp,
        u.plan, u.plan_expires_at, u.created_at,
        u.free_seconds_used, u.is_admin,
        COUNT(DISTINCT p.id) as profile_count
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE u.id != ?
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `).bind(user.id).all()

    const now = new Date().toISOString()

    const members = (rows.results as Record<string, unknown>[]).map(r => {
      const plan = r.plan as string
      const expiresAt = r.plan_expires_at as string | null
      let status: 'free' | 'active' | 'overdue'
      if (plan === 'free') {
        status = 'free'
      } else if (expiresAt && expiresAt < now) {
        status = 'overdue'
      } else {
        status = 'active'
      }

      return {
        id: r.id,
        name: r.name,
        email: r.email,
        whatsapp: r.whatsapp ?? null,
        plan,
        planExpiresAt: expiresAt,
        status,
        profileCount: r.profile_count,
        freeSecondsUsed: r.free_seconds_used ?? 0,
        createdAt: r.created_at,
        isAdmin: r.is_admin === 1,
      }
    })

    const summary = {
      total: members.length,
      active: members.filter(m => m.status === 'active').length,
      free: members.filter(m => m.status === 'free').length,
      overdue: members.filter(m => m.status === 'overdue').length,
      basic: members.filter(m => m.plan === 'basic').length,
      premium: members.filter(m => m.plan === 'premium').length,
    }

    return json({ members, summary })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}
