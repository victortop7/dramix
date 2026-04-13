import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'
import { getUser } from '../../lib/auth'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const user = await getUser(request as unknown as Request, env)
    if (!user || !user.isAdmin) {
      return new Response('Unauthorized', { status: 401 }) as unknown as import('@cloudflare/workers-types').Response
    }

    const users = await env.DB.prepare(`
      SELECT name, email, whatsapp FROM users
      WHERE is_admin = 0
      ORDER BY created_at DESC
    `).all()

    // Formato Meta Ads: fn (first name), ln (last name), email, phone
    const rows = (users.results as { name: string; email: string; whatsapp: string | null }[]).map(u => {
      const parts = u.name.trim().split(' ')
      const fn = parts[0] ?? ''
      const ln = parts.slice(1).join(' ') ?? ''

      // Normaliza telefone: remove tudo que não é número e garante +55
      let phone = ''
      if (u.whatsapp) {
        const digits = u.whatsapp.replace(/\D/g, '')
        phone = digits.startsWith('55') ? `+${digits}` : `+55${digits}`
      }

      return [fn, ln, u.email, phone]
    })

    const header = 'fn,ln,email,phone'
    const csv = [header, ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n')

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="dramix-contatos-meta-ads.csv"',
      },
    }) as unknown as import('@cloudflare/workers-types').Response
  } catch (e) {
    return new Response(String(e), { status: 500 }) as unknown as import('@cloudflare/workers-types').Response
  }
}
