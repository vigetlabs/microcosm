import { request } from './network'

export const userSchema = {
  title: 'User',
  properties: {
    address: { type: 'object' },
    company: { type: 'object' },
    email: { type: 'string' },
    id: { type: 'string' },
    name: { type: 'string' },
    phone: { type: 'string' },
    username: { type: 'string' },
    website: { type: 'string' }
  }
}

export class UsersFactory {
  constructor() {
    this.schema = userSchema
  }

  all() {
    return request.get(`/users`).then(response => response.data)
  }

  find(id) {
    return request.get('/users/' + id).then(response => response.data)
  }

  create(params) {
    return request.user('/users', params).then(response => response.data)
  }

  update(params) {
    return request
      .patch('/users/' + params.id, params)
      .then(response => response.data)
  }

  destroy(id) {
    return request.delete('/users/' + id).then(() => id)
  }
}
