// Gera URL assinada AWS Signature V4 para PUT direto no R2
async function hmac(key: ArrayBuffer, data: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  return crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data))
}

function hex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function createPresignedPutUrl(opts: {
  accessKeyId: string
  secretAccessKey: string
  endpoint: string   // ex: https://ACCOUNT_ID.r2.cloudflarestorage.com
  bucket: string
  key: string
  expiresIn?: number // segundos, padrão 7200
}): Promise<string> {
  const { accessKeyId, secretAccessKey, endpoint, bucket, key, expiresIn = 7200 } = opts
  const region = 'auto'
  const service = 's3'

  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')           // YYYYMMDD
  const amzDate = now.toISOString().replace(/[:-]/g, '').replace(/\.\d+/, '') // YYYYMMDDTHHmmssZ

  const host = new URL(endpoint).host
  const encodedKey = key.split('/').map(s => encodeURIComponent(s)).join('/')

  const credential = `${accessKeyId}/${dateStr}/${region}/${service}/aws4_request`
  const signedHeaders = 'host'

  const queryParams: [string, string][] = [
    ['X-Amz-Algorithm', 'AWS4-HMAC-SHA256'],
    ['X-Amz-Credential', credential],
    ['X-Amz-Date', amzDate],
    ['X-Amz-Expires', String(expiresIn)],
    ['X-Amz-SignedHeaders', signedHeaders],
  ].sort(([a], [b]) => a.localeCompare(b))

  const canonicalQueryString = queryParams
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')

  const canonicalRequest = [
    'PUT',
    `/${bucket}/${encodedKey}`,
    canonicalQueryString,
    `host:${host}\n`,
    signedHeaders,
    'UNSIGNED-PAYLOAD',
  ].join('\n')

  const requestHash = hex(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalRequest))
  )

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    `${dateStr}/${region}/${service}/aws4_request`,
    requestHash,
  ].join('\n')

  const enc = new TextEncoder()
  const kDate    = await hmac(enc.encode(`AWS4${secretAccessKey}`), dateStr)
  const kRegion  = await hmac(kDate, region)
  const kService = await hmac(kRegion, service)
  const kSigning = await hmac(kService, 'aws4_request')
  const signature = hex(await hmac(kSigning, stringToSign))

  return `${endpoint}/${bucket}/${encodedKey}?${canonicalQueryString}&X-Amz-Signature=${signature}`
}
