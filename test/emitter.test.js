import Emitter from '../src/emitter'

test('adds listeners', function () {
  const emitter = new Emitter
  const calls = []

  emitter.on('foo', function (val) {
    calls.push('one', val)
  })

  emitter.on('foo', function (val) {
    calls.push('two', val)
  })

  emitter._emit('foo', 1)
  emitter._emit('bar', 1)
  emitter._emit('foo', 2)

  expect(calls).toEqual([ 'one', 1, 'two', 1, 'one', 2, 'two', 2 ])
})

test('adds a single-shot listener', function () {
  const emitter = new Emitter
  const callback = jest.fn()

  emitter.once('foo', callback)

  emitter._emit('foo', 1)
  emitter._emit('foo', 2)
  emitter._emit('foo', 3)
  emitter._emit('bar', 1)

  expect(callback).toHaveBeenCalledTimes(1)
})

test('does not call listeners removed when another is emitted', function (done) {
  const emitter = new Emitter

  function two () {
    throw new Error("should not have been called")
  }

  emitter.on('foo', function() {
    emitter.off('foo', two)
    done()
  })

  emitter.on('foo', two)

  emitter._emit('foo')
})

describe('removal', function() {
  test('should remove a listener', function () {
    var emitter = new Emitter
    var calls = []

    const one = () => calls.push('one')
    const two = () => calls.push('two')

    emitter.on('foo', one)
    emitter.on('foo', two)
    emitter.off('foo', two)

    emitter._emit('foo')

    expect(calls).toEqual(['one'])
  })

  test('gracefully handles removing listeners not set', function () {
    const emitter = new Emitter()

    emitter.off('foo')
  })

  test('should remove all listeners for an event', function () {
    const emitter = new Emitter
    const calls = []

    const one = () => calls.push('one')
    const two = () => calls.push('two')

    emitter.on('foo', one)
    emitter.on('foo', two)
    emitter.off('foo')

    emitter._emit('foo')
    emitter._emit('foo')

    expect(calls.length).toBe(0)
  })

  test('should remove all listeners', function () {
    const emitter = new Emitter
    const calls = []

    function one () { calls.push('one') }
    function two () { calls.push('two') }

    emitter.on('foo', one)
    emitter.on('bar', two)

    emitter._emit('foo')
    emitter._emit('bar')

    emitter.removeAllListeners()

    emitter._emit('foo')
    emitter._emit('bar')

    expect(calls).toEqual(['one', 'two'])
  })

  test('off removes once subscriptions', function () {
    const emitter = new Emitter()

    function one () {
      throw new Error("Should not have been called")
    }

    emitter.once('foo', one)
    emitter.once('fee', one)
    emitter.off('foo', one)

    emitter._emit('foo')
  })
})
