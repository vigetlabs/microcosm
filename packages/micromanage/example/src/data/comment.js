import { request } from './network'

export const commentSchema = {
  title: 'Comment',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
    body: { type: 'string' },
    postId: { type: 'string' }
  }
}

export class CommentsFactory {
  constructor() {
    this.schema = commentSchema
  }

  all(id) {
    return request.get(`/posts/${id}/comments`).then(response => response.data)
  }

  find(id) {
    return request.get('/comments/' + id).then(response => response.data)
  }

  create(params) {
    return request.comment('/comments', params).then(response => response.data)
  }

  update(params) {
    return request
      .patch('/comments/' + params.id, params)
      .then(response => response.data)
  }

  destroy(id) {
    return request.delete('/comments/' + id).then(() => id)
  }
}
