import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const rows = await env.DB.prepare(`
      SELECT d.*, GROUP_CONCAT(c.name, '||') as tag_names
      FROM dramas d
      LEFT JOIN drama_categories dc ON dc.drama_id = d.id
      LEFT JOIN categories c ON c.id = dc.category_id
      WHERE d.is_featured = 1
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `).all()

    const dramas = ((rows.results ?? []) as Record<string, unknown>[]).map(row => ({
      id: row.id, title: row.title, description: row.description,
      thumbnailUrl: row.thumbnail_url, videoUrl: row.video_url,
      durationSeconds: row.duration_seconds,
      isDubbed: row.is_dubbed === 1, isNew: row.is_new === 1, isExclusive: row.is_exclusive === 1,
      rating: row.rating, views: row.views, categories: [],
      tags: row.tag_names ? (row.tag_names as string).split('||').slice(0, 3) : [],
      createdAt: row.created_at,
    }))

    return json({ dramas, drama: dramas[0] ?? null })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  })
}
