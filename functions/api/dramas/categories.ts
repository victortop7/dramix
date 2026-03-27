import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../lib/types'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const url = new URL(request.url)
    const slug = url.searchParams.get('slug')

    // Buscar categorias
    let catsQuery = 'SELECT * FROM categories ORDER BY sort_order ASC'
    const catsParams: unknown[] = []
    if (slug) {
      catsQuery = 'SELECT * FROM categories WHERE slug = ? ORDER BY sort_order ASC'
      catsParams.push(slug)
    }

    const cats = await env.DB.prepare(catsQuery).bind(...catsParams).all()

    // Para cada categoria, buscar dramas
    const result = await Promise.all(
      (cats.results as { id: string; name: string; slug: string; sort_order: number }[]).map(async (cat) => {
        const dramas = await env.DB.prepare(`
          SELECT d.*,
            GROUP_CONCAT(c2.id || ':' || c2.name || ':' || c2.slug, '||') as cats_raw
          FROM drama_categories dc
          JOIN dramas d ON d.id = dc.drama_id
          LEFT JOIN drama_categories dc2 ON dc2.drama_id = d.id
          LEFT JOIN categories c2 ON c2.id = dc2.category_id
          WHERE dc.category_id = ?
          GROUP BY d.id
          ORDER BY d.created_at DESC
          LIMIT 20
        `).bind(cat.id).all()

        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          sortOrder: cat.sort_order,
          dramas: (dramas.results as Record<string, unknown>[]).map(d => mapDrama(d)),
        }
      })
    )

    // Filtrar categorias sem dramas
    const filtered = result.filter(c => c.dramas.length > 0)
    return json({ categories: filtered })
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
    rating: d.rating, views: d.views, categories,
    createdAt: d.created_at,
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  })
}
