import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'
import { getUser } from '../../lib/auth'

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const user = await getUser(request, env)
    if (!user?.is_admin) return json({ error: 'Unauthorized' }, 403)

    const dramas = await env.DB.prepare(`
      SELECT d.*,
        GROUP_CONCAT(c.id || ':' || c.name || ':' || c.slug, '||') as cats_raw
      FROM dramas d
      LEFT JOIN drama_categories dc ON dc.drama_id = d.id
      LEFT JOIN categories c ON c.id = dc.category_id
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `).all()

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
    if (!user?.is_admin) return json({ error: 'Unauthorized' }, 403)

    const data = await request.json() as Record<string, unknown>
    const { title, description, thumbnailUrl, videoUrl, isDubbed, isNew, isExclusive, categoryIds } = data

    if (!title) return json({ error: 'Título obrigatório' }, 400)

    const id = crypto.randomUUID()
    await env.DB.prepare(`
      INSERT INTO dramas (id, title, description, thumbnail_url, video_url, is_dubbed, is_new, is_exclusive)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, title, description ?? null, thumbnailUrl ?? null, videoUrl ?? null,
      isDubbed ? 1 : 0, isNew ? 1 : 0, isExclusive ? 1 : 0
    ).run()

    if (Array.isArray(categoryIds) && categoryIds.length > 0) {
      const stmts = (categoryIds as string[]).map(cid =>
        env.DB.prepare('INSERT OR IGNORE INTO drama_categories (drama_id, category_id) VALUES (?, ?)').bind(id, cid)
      )
      await env.DB.batch(stmts)
    }

    const drama = await env.DB.prepare('SELECT * FROM dramas WHERE id = ?').bind(id).first() as Record<string, unknown>
    return json({ drama: mapDrama({ ...drama, cats_raw: null }) }, 201)
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
