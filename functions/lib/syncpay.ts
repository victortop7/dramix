const BASE_URL = 'https://api.syncpayments.com.br'

export async function getSyncPayToken(clientId: string, clientSecret: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/partner/v1/auth-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret }),
  })
  const raw = await res.text()
  if (!res.ok) throw new Error(`Auth falhou (${res.status}): ${raw.slice(0, 200)}`)
  const data = JSON.parse(raw) as Record<string, unknown>
  const token = String(data.access_token ?? '')
  if (!token) throw new Error(`Token não retornado: ${raw.slice(0, 200)}`)
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
  const res = await fetch(`${BASE_URL}/v1/gateway/api`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      amount: Math.round(params.amount * 100),
      ip: '177.0.0.1',
      traceable: true,
      postbackUrl: params.postbackUrl,
      pix: { expiresInDays: '1' },
      items: [{
        title: params.description,
        quantity: 1,
        tangible: false,
        unitPrice: Math.round(params.amount * 100),
      }],
      customer: {
        name: params.name,
        email: params.email,
        cpf: params.cpf.replace(/\D/g, ''),
        phone: params.phone.replace(/\D/g, ''),
        externalReference: params.externalReference,
        address: {
          street: 'Rua não informada',
          number: '0',
          complement: '',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipcode: '01310000',
        },
      },
    }),
  })

  const rawText = await res.text()

  // Se retornou HTML, o endpoint está errado ou não autorizado
  if (rawText.trimStart().startsWith('<')) {
    throw new Error(`Endpoint retornou HTML (${res.status}) — verifique as credenciais`)
  }

  if (!res.ok) throw new Error(`SyncPay (${res.status}): ${rawText.slice(0, 300)}`)

  let data: Record<string, unknown>
  try {
    data = JSON.parse(rawText) as Record<string, unknown>
  } catch {
    throw new Error(`Resposta inválida: ${rawText.slice(0, 300)}`)
  }

  // version < 0 ou version = 2 = erro do SyncPay
  if (data.version !== undefined && !data.paymentCode && !data.payment_code && !data.pix_code && !data.paymentcode) {
    throw new Error(`SyncPay rejeitou (version=${data.version}). Verifique o payload.`)
  }

  return {
    transactionId: String(data.transaction_id ?? data.idTransaction ?? data.id ?? ''),
    pixCode: String(data.payment_code ?? data.paymentCode ?? data.paymentcode ?? data.pix_code ?? ''),
    pixQrCode: String(data.paymentCodeBase64 ?? data.payment_code_base64 ?? data.qrCode ?? ''),
  }
}
