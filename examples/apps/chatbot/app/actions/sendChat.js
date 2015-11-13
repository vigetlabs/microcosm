import uid from 'uid'

/**
 * `sendChat` is an ES6 generator. Generators use the `yield` keyword to create
 * steps in an ES6 iterable.
 *
 * Microcosm processes each of these iterations sequentially, using the most
 * recently resolved iteration as the payload of the action.
 *
 * More on generators:
 * http://babeljs.io/docs/learn-es2015/#generators
 */
export default function* sendChat (message) {
  const question = {
    message,
    id   : uid(),
    time : new Date(),
    user : 'You'
  }

  // First, optimistically update the UI with the requested chat message.
  // A `pending` flag is also added so that the UI can indicate the message
  // has not been sent.
  yield { pending: true, ...question }

  // `fetch` returns a Promise. When it resolves, the transaction created
  // when sendChat was called will replace its old payload value with the result
  const request = fetch('/chatbot/message', { method: 'POST', body: message })

  yield request.then(data => data.json())
               .then(reply => [ question, reply ])
}
