let update = require('../src/update')
let assert = require('assert')

describe('update.get', function() {

  it ('can retrieve a key path', function() {
    assert.equal(update.get({ one: { two : 3 } }, [ 'one', 'two' ]), 3)
  })

  it ('can retrieve a blank key path', function() {
    let subject = { foo: 'bar' }
    assert.equal(update.get(subject, []), subject)
  })

})

describe('update.set', function() {

  it ('can set a value from a key path', function() {
    let subject = { foo: 'bar' }
    let next = update.set(subject, [ 'fiz' ], 'buz')

    assert(next.fiz, 'buz')
  })

  it ('maintains existing objects when assigning deeply', function() {
    let subject = { a: { b: true } }
    let next = update.set(subject, [ 'a', 'c' ], true)

    assert.equal(next.a.b, true)
    assert.equal(next.a.c, true)
  })

  it ('overrides values when assigning deeper than that key', function() {
    let subject = { a: { b: true } }
    let next = update.set(subject, [ 'a', 'b', 'c' ], true)

    assert.deepEqual(next.a.b, { c: true })
  })

})
