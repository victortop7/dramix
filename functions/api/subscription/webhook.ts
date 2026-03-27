import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'

const APPROVED_STATUSES = ['APPROVED', 'PAID', 'approved', 'paid', 'COMPLETED', 'completed']

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const body = await request.text()
    const event = JSON.parse(body) as {
      data?: {
        id?: string
        idtransaction?: string
        status?: string
        externalreference?: string
        amount?: number
      }
      status?: string
      externalreference?: string
      idtransaction?: string
    }

    // SyncPay pode enviar em data{} ou no root
    const status = event.data?.status ?? event.status ?? ''
    const externalRef = event.data?.externalreference ?? event.externalreference ?? ''
    const transactionId = event.data?.id ?? event.data?.idtransaction ?? event.idtransaction ?? ''

    if (APPROVED_STATUSES.includes(status)) {
      const [userId, plan] = externalRef.split(':')
      if (userId && plan) {
        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + 1)

        await env.DB.prepare(
          'UPDATE users SET plan = ?, plan_expires_at = ? WHERE id = ?'
        ).bind(plan, expiresAt.toISOString(), userId).run()

        if (transactionId) {
          await env.DB.prepare(
            "UPDATE subscriptions SET status = 'active', expires_at = ? WHERE syncpay_id = ?"
          ).bind(expiresAt.toISOString(), transactionId).run()
        }
      }
    }

    return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch {
    return new Response('{}', { status: 200 })
  }
}
