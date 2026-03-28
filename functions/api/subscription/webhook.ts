import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'

// Asaas envia PAYMENT_RECEIVED ou PAYMENT_CONFIRMED quando o PIX é pago
const PAID_EVENTS = ['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED']

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const body = await request.text()
    const event = JSON.parse(body) as Record<string, unknown>

    const eventType = String(event.event ?? '')
    const payment = event.payment as Record<string, unknown> | undefined

    if (PAID_EVENTS.includes(eventType) && payment) {
      const externalRef = String(payment.externalReference ?? '')
      const [userId, plan] = externalRef.split(':')

      if (userId && plan) {
        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + 1)

        await env.DB.prepare(
          'UPDATE users SET plan = ?, plan_expires_at = ? WHERE id = ?'
        ).bind(plan, expiresAt.toISOString(), userId).run()
      }
    }

    return new Response('{}', { status: 200 }) as unknown as import('@cloudflare/workers-types').Response
  } catch {
    return new Response('{}', { status: 200 }) as unknown as import('@cloudflare/workers-types').Response
  }
}
