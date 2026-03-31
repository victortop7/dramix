const BASE_URL = 'https://api.asaas.com/v3'

async function req(apiKey: string, method: string, path: string, body?: unknown) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'access_token': apiKey,
      'User-Agent': 'Dramix/1.0',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data: Record<string, unknown>
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(`Asaas: ${text.slice(0, 200)}`)
  }
  if (!res.ok) {
    const msg = (data.errors as Array<{ description: string }> | undefined)?.[0]?.description
      ?? data.message ?? String(data)
    throw new Error(`Asaas ${res.status}: ${msg}`)
  }
  return data
}

// Cria ou reutiliza cliente pelo CPF
async function getOrCreateCustomer(apiKey: string, name: string, email: string, cpf: string): Promise<string> {
  const cpfClean = cpf.replace(/\D/g, '')
  // Tenta buscar cliente existente pelo CPF
  const search = await req(apiKey, 'GET', `/customers?cpfCnpj=${cpfClean}`)
  const existing = (search.data as Record<string, unknown>[] | undefined)?.[0]
  if (existing?.id) return existing.id as string

  // Cria novo cliente
  const customer = await req(apiKey, 'POST', '/customers', { name, email, cpfCnpj: cpfClean })
  return customer.id as string
}

// Assinatura recorrente PIX — gera novo QR Code todo mês automaticamente
export async function createPixSubscription(apiKey: string, opts: {
  name: string
  email: string
  cpf: string
  amount: number
  description: string
  externalReference: string
}) {
  const customerId = await getOrCreateCustomer(apiKey, opts.name, opts.email, opts.cpf)

  const nextDue = new Date()
  nextDue.setDate(nextDue.getDate() + 1)
  const nextDueStr = nextDue.toISOString().split('T')[0]

  // Cria assinatura mensal PIX
  const subscription = await req(apiKey, 'POST', '/subscriptions', {
    customer: customerId,
    billingType: 'PIX',
    value: opts.amount,
    nextDueDate: nextDueStr,
    cycle: 'MONTHLY',
    description: opts.description,
    externalReference: opts.externalReference,
  })

  const subscriptionId = subscription.id as string

  // Busca a primeira cobrança gerada pela assinatura
  const payments = await req(apiKey, 'GET', `/subscriptions/${subscriptionId}/payments`)
  const firstPayment = (payments.data as Record<string, unknown>[] | undefined)?.[0]
  if (!firstPayment?.id) throw new Error('Cobrança da assinatura não encontrada')

  const paymentId = firstPayment.id as string

  // Busca QR Code PIX da primeira cobrança
  const pixData = await req(apiKey, 'GET', `/payments/${paymentId}/pixQrCode`)

  return {
    subscriptionId,
    paymentId,
    pixCode: pixData.payload as string,
    pixQrCode: pixData.encodedImage as string,
  }
}

// Cancela assinatura no Asaas
export async function cancelSubscription(apiKey: string, subscriptionId: string) {
  await req(apiKey, 'DELETE', `/subscriptions/${subscriptionId}`)
}
