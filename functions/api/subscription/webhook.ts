import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'

// Webhook SyncPay — chamado quando pagamento é confirmado/cancelado
export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  try {
    // Verificar assinatura do webhook
    const signature = request.headers.get('X-SyncPay-Signature') ?? ''
    const body = await request.text()
    const expected = await hmac(body, env.SYNCPAY_WEBHOOK_SECRET)
    if (signature !== expected) return new Response('Unauthorized', { status: 401 })

    const event = JSON.parse(body) as {
      event: string
      data: { id: string; metadata: { userId: string; plan: string }; status: string }
    }

    if (event.event === 'payment.confirmed' || event.event === 'subscription.active') {
      const { userId, plan } = event.data.metadata
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 1)

      await env.DB.prepare(
        "UPDATE users SET plan = ?, plan_expires_at = ? WHERE id = ?"
      ).bind(plan, expiresAt.toISOString(), userId).run()

      await env.DB.prepare(
        "UPDATE subscriptions SET status = 'active', expires_at = ? WHERE syncpay_id = ?"
      ).bind(expiresAt.toISOString(), event.data.id).run()
    }

    if (event.event === 'subscription.cancelled' || event.event === 'payment.failed') {
      const { userId } = event.data.metadata
      await env.DB.prepare("UPDATE users SET plan = 'free' WHERE id = ?").bind(userId).run()
      await env.DB.prepare(
        "UPDATE subscriptions SET status = 'cancelled' WHERE syncpay_id = ?"
      ).bind(event.data.id).run()
    }

    return new Response('OK', { status: 200 })
  } catch (e) {
    return new Response(String(e), { status: 500 })
  }
}

async function hmac(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
}
