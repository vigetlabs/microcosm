import { Entity } from 'micromanage'
import { POST } from './schema'

export class Post extends Entity(POST) {
  static async index(params) {
    let url = Post.url(params)
    let response = await Post.request(url, { params })

    return {
      data: response.data,
      page: Math.max(parseInt(params._page), 1),
      total: parseInt(response.headers['x-total-count'])
    }
  }
}
