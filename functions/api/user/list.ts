import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'
import { getUser } from '../../lib/auth'

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const user = await getUser(request, env)
    if (!user) return json({ error: 'Não autenticado' }, 401)

    const profileId = new URL(request.url).searchParams.get('profileId')
    if (!profileId) return json({ error: 'profileId obrigatório' }, 400)

    const dramas = await env.DB.prepare(`
      SELECT d.*, GROUP_CONCAT(c.id || ':' || c.name || ':' || c.slug, '||') as cats_raw
      FROM user_list ul
      JOIN dramas d ON d.id = ul.drama_id
      LEFT JOIN drama_categories dc ON dc.drama_id = d.id
      LEFT JOIN categories c ON c.id = dc.category_id
      WHERE ul.profile_id = ?
      GROUP BY d.id
      ORDER BY ul.added_at DESC
    `).bind(profileId).all()

    return json({
      dramas: (dramas.results as Record<string, unknown>[]).map(mapDrama),
    })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const user = await getUser(request, env)
    if (!user) return json({ error: 'Não autenticado' }, 401)
    const { profileId, dramaId } = await request.json() as { profileId: string; dramaId: string }
    await env.DB.prepare('INSERT OR IGNORE INTO user_list (profile_id, drama_id) VALUES (?, ?)').bind(profileId, dramaId).run()
    return json({ success: true })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}

function mapDrama(d: Record<string, unknown>) {
  const catsRaw = d.cats_raw as string | null
  const categories = catsRaw
    ? [...new Map(catsRaw.split('||').map(s => {
        const [id, name, slug] = s.split(':')
        return [id, { id, name, slug }]
      })).values()]
    : []
  return {
    id: d.id, title: d.title, description: d.description,
    thumbnailUrl: d.thumbnail_url, videoUrl: d.video_url,
    durationSeconds: d.duration_seconds,
    isDubbed: d.is_dubbed === 1, isNew: d.is_new === 1, isExclusive: d.is_exclusive === 1,
    rating: d.rating, views: d.views, categories, createdAt: d.created_at,
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  })
}
