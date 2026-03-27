import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const q = new URL(request.url).searchParams.get('q') ?? ''
    if (!q.trim()) return json({ dramas: [] })

    const dramas = await env.DB.prepare(`
      SELECT d.*,
        GROUP_CONCAT(c.id || ':' || c.name || ':' || c.slug, '||') as cats_raw
      FROM dramas d
      LEFT JOIN drama_categories dc ON dc.drama_id = d.id
      LEFT JOIN categories c ON c.id = dc.category_id
      WHERE d.title LIKE ?
      GROUP BY d.id
      ORDER BY d.views DESC
      LIMIT 30
    `).bind(`%${q}%`).all()

    return json({
      dramas: (dramas.results as Record<string, unknown>[]).map(d => ({
        id: d.id, title: d.title, description: d.description,
        thumbnailUrl: d.thumbnail_url, videoUrl: d.video_url,
        durationSeconds: d.duration_seconds,
        isDubbed: d.is_dubbed === 1, isNew: d.is_new === 1, isExclusive: d.is_exclusive === 1,
        rating: d.rating, views: d.views,
        categories: d.cats_raw
          ? [...new Map((d.cats_raw as string).split('||').map(s => {
              const [id, name, slug] = s.split(':')
              return [id, { id, name, slug }]
            })).values()]
          : [],
        createdAt: d.created_at,
      })),
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
