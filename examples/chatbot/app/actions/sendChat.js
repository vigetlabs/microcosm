import Eliza   from 'elizabot'
import Message from '../records/message'
import Promise from 'promise'

const bot = new Eliza()

let fakeResponse = function (message) {
  return new Promise(function (resolve, reject) {
    let answer = { user: 'Eliza', message: bot.transform(message) }

    setTimeout(function() {
      resolve(answer)
    }, 1500)
  })
}

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
  // First, optimistically update the UI with the requested chat message.
  // A `pending` flag is also added so that the UI can indicate the message
  // has not been sent.
  let question = yield Message({ message, user: 'You', pending: true })

  // Return a fake response
  yield fakeResponse(message).then(reply => [ Message({ ...question, pending: false }), reply ])
}
