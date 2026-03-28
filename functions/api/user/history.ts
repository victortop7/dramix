import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'
import { getUser } from '../../lib/auth'

// GET /api/user/history?profileId=xxx — retorna últimos dramas assistidos com progresso
export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const user = await getUser(request as unknown as Request, env)
    if (!user) return json({ error: 'Unauthorized' }, 401)

    const url = new URL(request.url)
    const profileId = url.searchParams.get('profileId')
    if (!profileId) return json({ error: 'profileId obrigatório' }, 400)

    const rows = await env.DB.prepare(`
      SELECT wh.drama_id, wh.progress_seconds, wh.watched_at,
             d.title, d.thumbnail_url, d.video_url, d.duration_seconds,
             d.is_dubbed, d.is_new, d.is_exclusive
      FROM watch_history wh
      JOIN dramas d ON d.id = wh.drama_id
      WHERE wh.profile_id = ?
      ORDER BY wh.watched_at DESC
      LIMIT 20
    `).bind(profileId).all()

    const dramas = ((rows.results ?? []) as Record<string, unknown>[]).map(r => ({
      id: r.drama_id,
      title: r.title,
      thumbnailUrl: r.thumbnail_url,
      videoUrl: r.video_url,
      durationSeconds: r.duration_seconds,
      progressSeconds: r.progress_seconds,
      watchedAt: r.watched_at,
      isDubbed: r.is_dubbed === 1,
      isNew: r.is_new === 1,
      isExclusive: r.is_exclusive === 1,
    }))

    return json({ dramas })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}

// POST /api/user/history — salva progresso
export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const user = await getUser(request as unknown as Request, env)
    if (!user) return json({ error: 'Unauthorized' }, 401)

    const { profileId, dramaId, progressSeconds } = await request.json() as {
      profileId: string; dramaId: string; progressSeconds: number
    }
    if (!profileId || !dramaId) return json({ error: 'Params inválidos' }, 400)

    // busca progresso anterior para calcular delta
    const prev = await env.DB.prepare(
      'SELECT progress_seconds FROM watch_history WHERE profile_id = ? AND drama_id = ?'
    ).bind(profileId, dramaId).first() as { progress_seconds: number } | null

    await env.DB.prepare(`
      INSERT INTO watch_history (profile_id, drama_id, progress_seconds, watched_at)
      VALUES (?, ?, ?, datetime('now'))
      ON CONFLICT (profile_id, drama_id) DO UPDATE SET
        progress_seconds = excluded.progress_seconds,
        watched_at = excluded.watched_at
    `).bind(profileId, dramaId, progressSeconds).run()

    // acumula segundos no usuário free
    const delta = progressSeconds - (prev?.progress_seconds ?? 0)
    if (delta > 0) {
      const profile = await env.DB.prepare('SELECT user_id FROM profiles WHERE id = ?').bind(profileId).first() as { user_id: string } | null
      if (profile) {
        const usr = await env.DB.prepare('SELECT plan FROM users WHERE id = ?').bind(profile.user_id).first() as { plan: string } | null
        if (usr?.plan === 'free') {
          await env.DB.prepare(
            'UPDATE users SET free_seconds_used = MIN(free_seconds_used + ?, 1800) WHERE id = ?'
          ).bind(delta, profile.user_id).run()
        }
      }
    }

    return json({ success: true })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  }) as unknown as import('@cloudflare/workers-types').Response
}
