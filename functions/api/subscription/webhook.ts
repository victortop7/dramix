import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'

const PAID_EVENTS = ['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED']
const OVERDUE_EVENTS = ['PAYMENT_OVERDUE', 'PAYMENT_DELETED', 'SUBSCRIPTION_DELETED']
const PIX_ACTIVATED = 'PIX_AUTOMATIC_RECURRING_AUTHORIZATION_ACTIVATED'
const PIX_CANCELLED = ['PIX_AUTOMATIC_RECURRING_AUTHORIZATION_DEACTIVATED', 'PIX_AUTOMATIC_RECURRING_AUTHORIZATION_CANCELLED']

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const token = request.headers.get('asaas-access-token') ?? ''
    if (env.ASAAS_WEBHOOK_TOKEN && token !== env.ASAAS_WEBHOOK_TOKEN) {
      return new Response('{}', { status: 401 }) as unknown as import('@cloudflare/workers-types').Response
    }

    const body = await request.text()
    const event = JSON.parse(body) as Record<string, unknown>

    const eventType = String(event.event ?? '')
    const payment = event.payment as Record<string, unknown> | undefined
    const pixAuth = event.pixAutomaticRecurringAuthorization as Record<string, unknown> | undefined

    // Pagamento confirmado → ativa plano por 35 dias (30 + 5 tolerância)
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

    // Pix Automático ativado → mesma coisa, garante ativação
    if (eventType === PIX_ACTIVATED && pixAuth) {
      const externalRef = String(pixAuth.externalReference ?? '')
      const [userId, plan] = externalRef.split(':')
      if (userId && plan) {
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 35)
        await env.DB.prepare(
          'UPDATE users SET plan = ?, plan_expires_at = ? WHERE id = ?'
        ).bind(plan, expiresAt.toISOString(), userId).run()
      }
    }

    // Pagamento atrasado ou cancelamento → rebaixa para free
    if (OVERDUE_EVENTS.includes(eventType) || PIX_CANCELLED.includes(eventType)) {
      const ref = payment?.externalReference ?? pixAuth?.externalReference
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
