import { post } from 'axios'

export function send(params) {
  return post('/message', params).then(response => response.data)
}

export function receive(message) {
  return message
}
