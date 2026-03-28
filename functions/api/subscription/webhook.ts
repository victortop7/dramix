import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'

// Valor em centavos → plano
const PLAN_BY_AMOUNT: Record<number, string> = {
  1590: 'basic',
  2990: 'premium',
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const body = await request.text()
    const event = JSON.parse(body) as Record<string, unknown>

    const any = (obj: unknown): Record<string, unknown> =>
      obj && typeof obj === 'object' ? (obj as Record<string, unknown>) : {}

    const data = any(event.data)
    const customer = any(event.customer ?? data.customer)

    // Extrair email do cliente (SyncPay Checkout envia no campo customer.email)
    const email = String(
      customer.email ?? event.email ?? data.email ?? ''
    ).toLowerCase().trim()

    // Extrair valor — pode vir em centavos ou reais
    const rawAmount = Number(event.amount ?? data.amount ?? event.value ?? data.value ?? 0)
    // SyncPay Checkout envia em centavos; se < 100 provavelmente é reais
    const amountCents = rawAmount >= 100 ? rawAmount : Math.round(rawAmount * 100)

    const plan = PLAN_BY_AMOUNT[amountCents]

    if (email && plan) {
      const userRow = await env.DB.prepare(
        'SELECT id FROM users WHERE LOWER(email) = ?'
      ).bind(email).first<{ id: string }>()

      if (userRow) {
        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + 1)

        await env.DB.prepare(
          'UPDATE users SET plan = ?, plan_expires_at = ? WHERE id = ?'
        ).bind(plan, expiresAt.toISOString(), userRow.id).run()
      }
    }

    return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }) as unknown as import('@cloudflare/workers-types').Response
  } catch {
    return new Response('{}', { status: 200 }) as unknown as import('@cloudflare/workers-types').Response
  }
}
