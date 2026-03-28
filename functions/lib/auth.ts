import type { Env } from './types'

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await hashPassword(password) === hash
}

export async function createToken(userId: string, secret: string): Promise<string> {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({ sub: userId, iat: Date.now(), exp: Date.now() + 30 * 24 * 60 * 60 * 1000 }))
  const signature = await sign(`${header}.${payload}`, secret)
  return `${header}.${payload}.${signature}`
}

export async function verifyToken(token: string, secret: string): Promise<{ sub: string } | null> {
  try {
    const [header, payload, signature] = token.split('.')
    if (!header || !payload || !signature) return null
    const expected = await sign(`${header}.${payload}`, secret)
    if (expected !== signature) return null
    const data = JSON.parse(atob(payload)) as { sub: string; exp: number }
    if (data.exp < Date.now()) return null
    return { sub: data.sub }
  } catch { return null }
}

async function sign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
}

export async function getUser(request: Request, env: Env) {
  const auth = request.headers.get('Authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return null
  const payload = await verifyToken(token, env.JWT_SECRET)
  if (!payload) return null

  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(payload.sub).first()
  return user as { id: string; name: string; email: string; plan: string; is_admin: number; free_seconds_used: number } | null
}
