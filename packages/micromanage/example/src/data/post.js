import { request } from './network'

export const postSchema = {
  title: 'Post',
  required: ['title'],
  properties: {
    id: { type: 'number' },
    body: { type: 'string' },
    title: { type: 'string' },
    userId: { type: 'number' }
  }
}

export class PostsFactory {
  constructor() {
    this.schema = postSchema
  }

  all() {
    return request.get('/posts').then(response => response.data)
  }

  find(id) {
    return request.get('/posts/' + id).then(response => response.data)
  }

  create(params) {
    return request.post('/posts', params).then(response => response.data)
  }

  update(params) {
    return request
      .patch('/posts/' + params.id, params)
      .then(response => response.data)
  }

  destroy(id) {
    return request.delete('/posts/' + id).then(() => id)
  }
}
