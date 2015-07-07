/**
 * This example doesn't actually connect to a third party API,
 * however FakeJAX will simulate it!
 */

import bot from './bot'
import uid from 'uid'

function reply(message) {
  return {
    id: uid(),
    user: 'Eliza',
    time: new Date(),
    message: bot.transform(message)
  }
}

export default function fakeJAX(message) {
  // Fake some latency
  const DELAY = 500 + Math.random() * 500

  return new Promise(function(resolve, reject) {
    setTimeout(_ => resolve(reply(message)), DELAY)
  })
}
