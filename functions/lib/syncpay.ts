const BASE_URL = 'https://api.syncpayments.com.br'

export async function getSyncPayToken(clientId: string, clientSecret: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/partner/v1/auth-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret }),
  })
  if (!res.ok) throw new Error(`SyncPay auth: ${await res.text()}`)
  const { access_token } = await res.json() as { access_token: string }
  return access_token
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
      amount: params.amount,
      traceable: true,
      postbackUrl: params.postbackUrl,
      pix: { expiresInDays: 1 },
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
      metadata: {
        userEmail: params.email,
        identificationNumber: params.externalReference,
      },
    }),
  })
  const rawText = await res.text()
  if (!res.ok) throw new Error(`SyncPay: ${rawText}`)

  const data = JSON.parse(rawText) as Record<string, unknown>
  // Debug temporário: retorna as chaves da resposta
  throw new Error(`KEYS: ${Object.keys(data).join(',')} | RAW: ${rawText.slice(0, 400)}`)
}
