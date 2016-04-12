import { say } from '../../lib/chat'

export default function sendChat (message) {

  return function (action) {
    action.open(message)

    say(message).then(answer => action.close(answer),
                      error  => action.reject(error))
  }
}
