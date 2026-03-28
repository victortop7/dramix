// Trocar para 'https://api.asaas.com/v3' quando mudar para produção
const BASE_URL = 'https://sandbox.asaas.com/api/v3'

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

export async function createPixCharge(apiKey: string, opts: {
  name: string
  email: string
  cpf: string
  amount: number
  description: string
  externalReference: string
}) {
  // 1. Criar cliente
  const customer = await req(apiKey, 'POST', '/customers', {
    name: opts.name,
    email: opts.email,
    cpfCnpj: opts.cpf.replace(/\D/g, ''),
  })

  const customerId = customer.id as string

  // 2. Criar cobrança PIX
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
  })

  const paymentId = payment.id as string

  // 3. Buscar QR Code PIX
  const pixData = await req(apiKey, 'GET', `/payments/${paymentId}/pixQrCode`)

  return {
    paymentId,
    pixCode: pixData.payload as string,
    pixQrCode: pixData.encodedImage as string,
  }
}
