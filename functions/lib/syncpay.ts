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
      expiresInDays: 1,
      traceable: true,
      postbackUrl: params.postbackUrl,
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
  if (!res.ok) throw new Error(`SyncPay pagamento: ${await res.text()}`)
  const data = await res.json() as {
    transaction_id?: string
    idTransaction?: string
    payment_code?: string
    paymentCode?: string
    paymentCodeBase64?: string
  }
  return {
    transactionId: data.transaction_id ?? data.idTransaction ?? '',
    pixCode: data.payment_code ?? data.paymentCode ?? '',
    pixQrCode: data.paymentCodeBase64 ?? '',
  }
}
