import { post } from 'axios'

export function send(params) {
  return action => {
    action.next(true)

    post('/message', params).then(
      response => action.complete(response.data),
      action.error
    )
  }
}

export function receive(message) {
  return message
}
