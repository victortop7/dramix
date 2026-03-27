const BASE_URL = 'https://api.syncpayments.com.br'

export async function getSyncPayToken(clientId: string, clientSecret: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/partner/v1/auth-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret }),
  })
  const raw = await res.text()
  if (!res.ok) throw new Error(`SyncPay auth (${res.status}): ${raw}`)
  const data = JSON.parse(raw) as Record<string, unknown>
  const token = String(data.access_token ?? '')
  if (!token) throw new Error(`SyncPay auth sem token: ${raw}`)
  return token
}

export async function createPixPayment(token: string, params: {
  amount: number
  name: string
  email: string
  cpf: string
  phone: string
  externalReference: string
  postbackUrl: string
  description: string
}): Promise<{ transactionId: string; pixCode: string; pixQrCode: string }> {
  const res = await fetch(`${BASE_URL}/v1/cashin/api`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      amount: params.amount,
      ip: '177.0.0.1',
      traceable: true,
      postbackUrl: params.postbackUrl,
      pix: { expiresInDays: '1' },
      items: [{
        title: params.description,
        quantity: 1,
        tangible: false,
        unitPrice: params.amount,
      }],
      customer: {
        name: params.name,
        email: params.email,
        cpf: params.cpf.replace(/\D/g, ''),
        phone: params.phone.replace(/\D/g, ''),
        externalReference: params.externalReference,
      },
    }),
  })
  const rawText = await res.text()
  if (!res.ok) throw new Error(`SyncPay (${res.status}): ${rawText}`)

  const data = JSON.parse(rawText) as Record<string, unknown>

  if (typeof data.version === 'number' && !data.paymentCode && !data.payment_code && !data.pix_code) {
    throw new Error(`SyncPay erro: ${rawText}`)
  }

  return {
    transactionId: String(data.transaction_id ?? data.idTransaction ?? data.id ?? ''),
    pixCode: String(data.payment_code ?? data.paymentCode ?? data.paymentcode ?? data.pix_code ?? ''),
    pixQrCode: String(data.paymentCodeBase64 ?? data.payment_code_base64 ?? data.qrCode ?? ''),
  }
}
