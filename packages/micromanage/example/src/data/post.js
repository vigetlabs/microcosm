import { Entity } from 'micromanage'
import { POST } from './schema'

export class Post extends Entity(POST) {
  static async index(params) {
    let url = Post.url(params)
    let response = await Post.request(url, { params })

    // TODO: It would be cool to use this to set the cache.
    // Maybe use the expires header?
    return {
      data: response.data,
      meta: {
        page: Math.max(parseInt(params._page), 1),
        total: parseInt(response.headers['x-total-count']),
        count: response.data.length
      }
    }
  }
}
