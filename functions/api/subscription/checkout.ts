import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'
import { getUser } from '../../lib/auth'
import { createPixCharge } from '../../lib/asaas'

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
    const user = await getUser(request as unknown as Request, env)
    if (!user) return json({ error: 'Não autenticado' }, 401)

    const { plan, cpf } = await request.json() as { plan: string; cpf: string }
    if (!plan || !PLAN_PRICES[plan]) return json({ error: 'Plano inválido' }, 400)
    if (!cpf) return json({ error: 'CPF é obrigatório' }, 400)

    const externalRef = `${user.id}:${plan}`

    const charge = await createPixCharge(env.ASAAS_API_KEY, {
      name: user.name,
      email: user.email,
      cpf,
      amount: PLAN_PRICES[plan],
      description: PLAN_NAMES[plan],
      externalReference: externalRef,
    })

    return json({
      paymentId: charge.paymentId,
      pixCode: charge.pixCode,
      pixQrCode: charge.pixQrCode,
    })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  }) as unknown as import('@cloudflare/workers-types').Response
}
