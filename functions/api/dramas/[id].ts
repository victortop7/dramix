import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'
import { getUser } from '../../lib/auth'

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  try {
    const id = params.id as string
    const drama = await env.DB.prepare(`
      SELECT d.*,
        GROUP_CONCAT(c.id || ':' || c.name || ':' || c.slug, '||') as cats_raw
      FROM dramas d
      LEFT JOIN drama_categories dc ON dc.drama_id = d.id
      LEFT JOIN categories c ON c.id = dc.category_id
      WHERE d.id = ?
      GROUP BY d.id
    `).bind(id).first() as Record<string, unknown> | null

    if (!drama) return json({ error: 'Drama não encontrado' }, 404)
    return json({ drama: mapDrama(drama) })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}


export const onRequestDelete: PagesFunction<Env> = async ({ params, env, request }) => {
  try {
    const user = await getUser(request, env)
    if (!user?.is_admin) return json({ error: 'Unauthorized' }, 403)
    await env.DB.prepare('DELETE FROM dramas WHERE id = ?').bind(params.id).run()
    return json({ success: true })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}

export const onRequestPatch: PagesFunction<Env> = async ({ params, env, request }) => {
  try {
    const user = await getUser(request, env)
    if (!user?.is_admin) return json({ error: 'Unauthorized' }, 403)

    const data = await request.json() as Record<string, unknown>
    const { title, description, isDubbed, isNew, isExclusive, thumbnailUrl, videoUrl, categoryIds } = data

    await env.DB.prepare(`
      UPDATE dramas SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        thumbnail_url = COALESCE(?, thumbnail_url),
        video_url = COALESCE(?, video_url),
        is_dubbed = COALESCE(?, is_dubbed),
        is_new = COALESCE(?, is_new),
        is_exclusive = COALESCE(?, is_exclusive),
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      title ?? null, description ?? null, thumbnailUrl ?? null, videoUrl ?? null,
      isDubbed !== undefined ? (isDubbed ? 1 : 0) : null,
      isNew !== undefined ? (isNew ? 1 : 0) : null,
      isExclusive !== undefined ? (isExclusive ? 1 : 0) : null,
      params.id
    ).run()

    if (Array.isArray(categoryIds)) {
      await env.DB.prepare('DELETE FROM drama_categories WHERE drama_id = ?').bind(params.id).run()
      if (categoryIds.length > 0) {
        const stmts = (categoryIds as string[]).map(cid =>
          env.DB.prepare('INSERT OR IGNORE INTO drama_categories (drama_id, category_id) VALUES (?, ?)').bind(params.id, cid)
        )
        await env.DB.batch(stmts)
      }
    }

    return json({ success: true })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}

function mapDrama(d: Record<string, unknown>) {
  const catsRaw = d.cats_raw as string | null
  const categories = catsRaw
    ? [...new Map(
        catsRaw.split('||').map(s => {
          const [id, name, slug] = s.split(':')
          return [id, { id, name, slug, sortOrder: 0 }]
        })
      ).values()]
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
