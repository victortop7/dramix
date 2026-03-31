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
  const search = await req(apiKey, 'GET', `/customers?cpfCnpj=${cpfClean}`)
  const existing = (search.data as Record<string, unknown>[] | undefined)?.[0]
  if (existing?.id) return existing.id as string
  const customer = await req(apiKey, 'POST', '/customers', { name, email, cpfCnpj: cpfClean })
  return customer.id as string
}

// Pix Automático com Adesão Imediata
// O cliente paga o primeiro QR Code e já autoriza todos os próximos automaticamente
export async function createPixAutomatic(apiKey: string, opts: {
  name: string
  email: string
  cpf: string
  amount: number
  description: string
  externalReference: string
}) {
  const customerId = await getOrCreateCustomer(apiKey, opts.name, opts.email, opts.cpf)

  const startDate = new Date()
  startDate.setDate(startDate.getDate() + 1)
  const startDateStr = startDate.toISOString().split('T')[0]

  // 1. Criar autorização Pix Automático
  const auth = await req(apiKey, 'POST', '/pix/automatic/authorizations', {
    customer: customerId,
    value: opts.amount,
    frequency: 'MONTHLY',
    startDate: startDateStr,
    description: opts.description,
    externalReference: opts.externalReference,
    originType: 'IMMEDIATE_PAYMENT_AND_RECURRING_QR_CODE',
  })

  const authId = auth.id as string

  // 2. Criar primeiro pagamento vinculado à autorização
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 1)
  const dueDateStr = dueDate.toISOString().split('T')[0]

  const payment = await req(apiKey, 'POST', '/payments', {
    customer: customerId,
    billingType: 'PIX',
    value: opts.amount,
    dueDate: dueDateStr,
    description: opts.description,
    externalReference: opts.externalReference,
    pixAutomaticAuthorizationId: authId,
  })

  const paymentId = payment.id as string

  // 3. Buscar QR Code PIX do primeiro pagamento
  const pixData = await req(apiKey, 'GET', `/payments/${paymentId}/pixQrCode`)

  return {
    authorizationId: authId,
    paymentId,
    pixCode: pixData.payload as string,
    pixQrCode: pixData.encodedImage as string,
  }
}

// Cancela autorização Pix Automático
export async function cancelPixAutomatic(apiKey: string, authorizationId: string) {
  await req(apiKey, 'DELETE', `/pix/automatic/authorizations/${authorizationId}`)
}
