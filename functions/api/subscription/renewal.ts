import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'
import { getUser } from '../../lib/auth'

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  }) as unknown as import('@cloudflare/workers-types').Response
}

// GET /api/subscription/renewal — retorna QR Code PIX de renovação pendente
export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const user = await getUser(request as unknown as Request, env)
    if (!user) return json({ error: 'Não autenticado' }, 401)

    // Busca subscription ID salvo
    const sub = await env.DB.prepare(
      "SELECT syncpay_id FROM subscriptions WHERE user_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1"
    ).bind(user.id).first() as { syncpay_id: string } | null

    if (!sub?.syncpay_id) return json({ error: 'Assinatura não encontrada' }, 404)

    // Busca cobranças pendentes/atrasadas da assinatura no Asaas
    const BASE_URL = 'https://api.asaas.com/v3'
    const res = await fetch(`${BASE_URL}/subscriptions/${sub.syncpay_id}/payments?status=PENDING,OVERDUE`, {
      headers: { 'access_token': env.ASAAS_API_KEY, 'User-Agent': 'Dramix/1.0' },
    })
    const data = await res.json() as { data?: Record<string, unknown>[] }
    const payment = data.data?.[0]
    if (!payment?.id) return json({ error: 'Sem cobrança pendente' }, 404)

    // Busca QR Code PIX
    const pixRes = await fetch(`${BASE_URL}/payments/${payment.id}/pixQrCode`, {
      headers: { 'access_token': env.ASAAS_API_KEY, 'User-Agent': 'Dramix/1.0' },
    })
    const pixData = await pixRes.json() as { payload?: string; encodedImage?: string }

    return json({
      pixCode: pixData.payload ?? '',
      pixQrCode: pixData.encodedImage ?? '',
      dueDate: payment.dueDate,
    })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}
