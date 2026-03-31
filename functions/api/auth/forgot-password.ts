import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  })
}

const WHATSAPP_NUMBER = '5585991295842'

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const { email } = await request.json() as { email: string }
    if (!email) return json({ error: 'E-mail obrigatório' }, 400)

    const user = await env.DB.prepare(
      'SELECT id, name, email FROM users WHERE email = ? AND is_admin = 0'
    ).bind(email.toLowerCase().trim()).first() as { id: string; name: string; email: string } | null

    // Sempre retorna sucesso para não revelar se e-mail existe
    if (!user) return json({ success: true })

    // Monta link do WhatsApp com mensagem para o admin
    const msg = encodeURIComponent(
      `🔐 *Solicitação de Reset de Senha — Dramix*\n\n` +
      `Nome: ${user.name}\n` +
      `E-mail: ${user.email}\n` +
      `ID: ${user.id}\n\n` +
      `O cliente solicitou redefinição de senha. Acesse o painel admin para redefinir.`
    )
    const waUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${msg}`

    // Salva token temporário de reset (válido por 1h)
    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1)

    await env.DB.prepare(`
      UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?
    `).bind(token, expiresAt.toISOString(), user.id).run()

    return json({ success: true, waUrl, resetToken: token })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}
