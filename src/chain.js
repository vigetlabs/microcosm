/**
 * Chain generator calls using nodeify
 */

let nodeify = require('./nodeify')

module.exports = function chain (iterator, callback) {
  return nodeify(iterator.next().value, function step (error, body) {
    let { value, done } = iterator.next()

    callback(error, body, done)

    return error || done ? body : nodeify(value, step)
  })
}
