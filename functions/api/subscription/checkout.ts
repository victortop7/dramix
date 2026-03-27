import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'
import { getUser } from '../../lib/auth'
import { getSyncPayToken, createPixPayment } from '../../lib/syncpay'

const PLAN_PRICES: Record<string, number> = {
  basic: 15.90,
  premium: 29.90,
}

const PLAN_NAMES: Record<string, string> = {
  basic: 'Dramix Básico — Acesso mensal',
  premium: 'Dramix Premium — Acesso mensal',
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const user = await getUser(request, env)
    if (!user) return json({ error: 'Não autenticado' }, 401)

    const { plan, cpf, phone } = await request.json() as { plan: string; cpf: string; phone?: string }
    if (!plan || !PLAN_PRICES[plan]) return json({ error: 'Plano inválido' }, 400)
    if (!cpf) return json({ error: 'CPF é obrigatório' }, 400)

    const token = await getSyncPayToken(env.SYNCPAY_CLIENT_ID, env.SYNCPAY_CLIENT_SECRET)

    const externalRef = `${user.id}:${plan}`
    const postbackUrl = 'https://dramix.pages.dev/api/subscription/webhook'

    const payment = await createPixPayment(token, {
      amount: PLAN_PRICES[plan],
      name: user.name,
      email: user.email,
      cpf,
      phone: phone ?? (user as any).whatsapp ?? '00000000000',
      externalReference: externalRef,
      postbackUrl,
      description: PLAN_NAMES[plan],
    })

    const subId = crypto.randomUUID()
    await env.DB.prepare(`
      INSERT INTO subscriptions (id, user_id, plan, status, syncpay_id, amount_cents)
      VALUES (?, ?, ?, 'pending', ?, ?)
    `).bind(subId, user.id, plan, payment.transactionId, Math.round(PLAN_PRICES[plan] * 100)).run()

    return json({
      transactionId: payment.transactionId,
      pixCode: payment.pixCode,
      pixQrCode: payment.pixQrCode,
    })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  })
}
