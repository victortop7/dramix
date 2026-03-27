import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const row = await env.DB.prepare(`
      SELECT d.*, GROUP_CONCAT(c.name, '||') as tag_names
      FROM featured_drama f
      JOIN dramas d ON d.id = f.drama_id
      LEFT JOIN drama_categories dc ON dc.drama_id = d.id
      LEFT JOIN categories c ON c.id = dc.category_id
      GROUP BY d.id
      LIMIT 1
    `).first() as Record<string, unknown> | null

    if (!row) return json({ drama: null })

    const tags = row.tag_names ? (row.tag_names as string).split('||').slice(0, 3) : []

    return json({
      drama: {
        id: row.id, title: row.title, description: row.description,
        thumbnailUrl: row.thumbnail_url, videoUrl: row.video_url,
        durationSeconds: row.duration_seconds,
        isDubbed: row.is_dubbed === 1, isNew: row.is_new === 1, isExclusive: row.is_exclusive === 1,
        rating: row.rating, views: row.views, categories: [], tags,
        createdAt: row.created_at,
      },
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
