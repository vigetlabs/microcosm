import fakeJAX from '../lib/fakejax'
import uid from 'uid'

export default function* sendChat (message) {
  const question = {
    id: uid(),
    message,
    time : new Date(),
    user : 'You',
  }

  yield { pending: true, ...question }
  yield fakeJAX(message).then(reply => [ question, reply ])
}
