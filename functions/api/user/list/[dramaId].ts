import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../../lib/types'
import { getUser } from '../../../lib/auth'

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  })
}

export const onRequestDelete: PagesFunction<Env> = async ({ params, env, request }) => {
  try {
    const user = await getUser(request, env)
    if (!user) return json({ error: 'Não autenticado' }, 401)

    const dramaId = params.dramaId as string
    const profileId = new URL(request.url).searchParams.get('profileId')
    if (!profileId) return json({ error: 'profileId obrigatório' }, 400)

    await env.DB.prepare('DELETE FROM user_list WHERE profile_id = ? AND drama_id = ?')
      .bind(profileId, dramaId).run()

    return json({ success: true })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}
