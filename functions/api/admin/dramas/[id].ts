import type { PagesFunction } from '@cloudflare/workers-types'
import type { Env } from '../../../lib/types'
import { getUser } from '../../../lib/auth'

export const onRequestPatch: PagesFunction<Env> = async ({ env, request, params }) => {
  try {
    const user = await getUser(request as unknown as Request, env)
    if (!user?.is_admin) return json({ error: 'Unauthorized' }, 403)

    const id = params.id as string
    const data = await request.json() as Record<string, unknown>

    const fields: string[] = []
    const values: unknown[] = []

    if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title) }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description) }
    if (data.thumbnailUrl !== undefined) { fields.push('thumbnail_url = ?'); values.push(data.thumbnailUrl) }
    if (data.videoUrl !== undefined) { fields.push('video_url = ?'); values.push(data.videoUrl) }
    if (data.isDubbed !== undefined) { fields.push('is_dubbed = ?'); values.push(data.isDubbed ? 1 : 0) }
    if (data.isNew !== undefined) { fields.push('is_new = ?'); values.push(data.isNew ? 1 : 0) }
    if (data.isExclusive !== undefined) { fields.push('is_exclusive = ?'); values.push(data.isExclusive ? 1 : 0) }

    if (fields.length > 0) {
      values.push(id)
      await env.DB.prepare(`UPDATE dramas SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run()
    }

    if (Array.isArray(data.categoryIds)) {
      await env.DB.prepare('DELETE FROM drama_categories WHERE drama_id = ?').bind(id).run()
      if ((data.categoryIds as string[]).length > 0) {
        const stmts = (data.categoryIds as string[]).map(cid =>
          env.DB.prepare('INSERT OR IGNORE INTO drama_categories (drama_id, category_id) VALUES (?, ?)').bind(id, cid)
        )
        await env.DB.batch(stmts)
      }
    }

    return json({ success: true })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
}

export const onRequestDelete: PagesFunction<Env> = async ({ env, request, params }) => {
  try {
    const user = await getUser(request as unknown as Request, env)
    if (!user?.is_admin) return json({ error: 'Unauthorized' }, 403)

    const id = params.id as string
    await env.DB.prepare('DELETE FROM dramas WHERE id = ?').bind(id).run()
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
