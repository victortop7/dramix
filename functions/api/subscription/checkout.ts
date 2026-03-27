import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'
import { getUser } from '../../lib/auth'

// Preços em centavos
const PLAN_PRICES: Record<string, number> = {
  basic: 1490,
  premium: 2990,
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const user = await getUser(request, env)
    if (!user) return json({ error: 'Não autenticado' }, 401)

    const { plan } = await request.json() as { plan: string }
    if (!plan || !PLAN_PRICES[plan]) return json({ error: 'Plano inválido' }, 400)

    // SyncPay — criar sessão de checkout
    // Documentação: https://syncpay.com.br/docs (placeholder)
    const syncpayRes = await fetch('https://api.syncpay.com.br/v1/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.SYNCPAY_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: PLAN_PRICES[plan],
        currency: 'BRL',
        description: `Dramix ${plan === 'basic' ? 'Básico' : 'Premium'} — Acesso mensal`,
        customer: { email: user.email, name: user.name },
        metadata: { userId: user.id, plan },
        success_url: 'https://dramix.app/assinatura/sucesso',
        cancel_url: 'https://dramix.app/assinatura',
        recurring: {
          interval: 'month',
          interval_count: 1,
        },
      }),
    })

    if (!syncpayRes.ok) {
      const err = await syncpayRes.text()
      return json({ error: `Erro SyncPay: ${err}` }, 502)
    }

    const { checkout_url, id: syncpayId } = await syncpayRes.json() as { checkout_url: string; id: string }

    // Registrar assinatura pendente
    const subId = crypto.randomUUID()
    await env.DB.prepare(`
      INSERT INTO subscriptions (id, user_id, plan, status, syncpay_id, amount_cents)
      VALUES (?, ?, ?, 'pending', ?, ?)
    `).bind(subId, user.id, plan, syncpayId, PLAN_PRICES[plan]).run()

    return json({ checkoutUrl: checkout_url })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  })
}
