import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'

const PAID_EVENTS = ['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED']
const OVERDUE_EVENTS = ['PAYMENT_OVERDUE', 'PAYMENT_DELETED', 'SUBSCRIPTION_DELETED']

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const body = await request.text()
    const event = JSON.parse(body) as Record<string, unknown>

    const eventType = String(event.event ?? '')
    const payment = event.payment as Record<string, unknown> | undefined
    const subscription = event.subscription as Record<string, unknown> | undefined

    // Pagamento confirmado → ativa/renova plano por 35 dias (5 dias de tolerância)
    if (PAID_EVENTS.includes(eventType) && payment) {
      const externalRef = String(payment.externalReference ?? '')
      const [userId, plan] = externalRef.split(':')

      if (userId && plan) {
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 35)

        await env.DB.prepare(
          'UPDATE users SET plan = ?, plan_expires_at = ? WHERE id = ?'
        ).bind(plan, expiresAt.toISOString(), userId).run()
      }
    }

    // Pagamento atrasado ou assinatura cancelada → rebaixa para free
    if (OVERDUE_EVENTS.includes(eventType)) {
      const ref = payment?.externalReference ?? subscription?.externalReference
      const externalRef = String(ref ?? '')
      const [userId] = externalRef.split(':')

      if (userId) {
        await env.DB.prepare(
          "UPDATE users SET plan = 'free', plan_expires_at = NULL WHERE id = ?"
        ).bind(userId).run()
      }
    }

    return new Response('{}', { status: 200 }) as unknown as import('@cloudflare/workers-types').Response
  } catch {
    return new Response('{}', { status: 200 }) as unknown as import('@cloudflare/workers-types').Response
  }
}
