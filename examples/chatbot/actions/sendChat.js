import fakeJAX from '../lib/fakejax'
import uid from 'uid'

/**
 * `sendChat` is an ES6 generator. Generators use the `yield` keyword to create
 * unique iterations in an ES6 iterable.
 *
 * Microcosm processes each of these iterations sequentially, using the most
 * recently resolved iteration as the payload of the action.
 */
export default function* sendChat (message) {
  const question = {
    message,
    id   : uid(),
    time : new Date(),
    user : 'You',
  }

  // First, optimistically update the UI with the requested chat message.
  // A `pending` flag is also added so that the UI can indicate the message
  // has not been sent.
  yield { pending: true, ...question }

  // `fakeJAX` returns a Promise. When it resolves, the transaction created
  // when sendChat was called will replace its old payload value with the result
  yield fakeJAX(message).then(function(reply) {
    // Send the question and reply as individual chat messages
    // to the store
    return [ question, reply ]
  })
}
