import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  })
}

export const onRequestGet: PagesFunction<Env> = async ({ request }) => {
  try {
    const url = new URL(request.url)
    const email = url.searchParams.get('email') ?? ''
    const domain = email.split('@')[1]?.toLowerCase()

    if (!domain) return json({ valid: false, reason: 'Email inválido' })

    // Domínios comuns — aceita direto sem DNS
    const known = ['gmail.com','hotmail.com','outlook.com','yahoo.com','icloud.com','live.com','msn.com','bol.com.br','uol.com.br','terra.com.br','ig.com.br']
    if (known.includes(domain)) return json({ valid: true })

    // Verifica MX via Cloudflare DNS over HTTPS
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`, {
      headers: { Accept: 'application/dns-json' },
    })
    const data = await res.json() as { Status: number; Answer?: unknown[] }

    if (data.Status === 0 && data.Answer && data.Answer.length > 0) {
      return json({ valid: true })
    }

    return json({ valid: false, reason: 'Este email não parece válido' })
  } catch {
    return json({ valid: true }) // em caso de erro, deixa passar
  }
}
