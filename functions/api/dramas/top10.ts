import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const dramas = await env.DB.prepare(`
      SELECT id, title, thumbnail_url, views, duration_seconds,
             is_dubbed, is_new, is_exclusive, rating
      FROM dramas
      ORDER BY views DESC
      LIMIT 10
    `).all()

    return json({
      dramas: (dramas.results as Record<string, unknown>[]).map((d, i) => ({
        rank: i + 1,
        id: d.id,
        title: d.title,
        thumbnailUrl: d.thumbnail_url,
        views: d.views,
        durationSeconds: d.duration_seconds,
        isDubbed: d.is_dubbed === 1,
        isNew: d.is_new === 1,
        isExclusive: d.is_exclusive === 1,
        rating: d.rating,
      }))
    })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  })
}
