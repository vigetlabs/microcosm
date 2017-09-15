import { Emitter } from 'microcosm'

describe.dev('Emitter', function() {
  it('adds listeners', function() {
    const emitter = new Emitter()
    const calls = []

    emitter.on('foo', function(val) {
      calls.push('one', val)
    })

    emitter.on('foo', function(val) {
      calls.push('two', val)
    })

    emitter._emit('foo', 1)
    emitter._emit('bar', 1)
    emitter._emit('foo', 2)

    expect(calls).toEqual(['one', 1, 'two', 1, 'one', 2, 'two', 2])
  })

  it('adds a single-shot listener', function() {
    const emitter = new Emitter()
    const callback = jest.fn()

    emitter.once('foo', callback)

    emitter._emit('foo', 1)
    emitter._emit('foo', 2)
    emitter._emit('foo', 3)
    emitter._emit('bar', 1)

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('does not call listeners removed when another is emitted', function(done) {
    const emitter = new Emitter()
    const handler = jest.fn()

    emitter.on('foo', function() {
      emitter.off('foo', handler)
      done()
    })

    emitter.on('foo', handler)

    emitter._emit('foo')

    expect(handler).not.toHaveBeenCalled()
  })

  describe('removal', function() {
    it('should remove a listener', function() {
      var emitter = new Emitter()
      var calls = []

      const one = () => calls.push('one')
      const two = () => calls.push('two')

      emitter.on('foo', one)
      emitter.on('foo', two)
      emitter.off('foo', two)

      emitter._emit('foo')

      expect(calls).toEqual(['one'])
    })

    it('gracefully handles removing listeners not set', function() {
      const emitter = new Emitter()

      emitter.off('foo')
    })

    it('should remove all listeners for an event', function() {
      const emitter = new Emitter()
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

    it('should remove all listeners', function() {
      const emitter = new Emitter()
      const calls = []

      function one() {
        calls.push('one')
      }
      function two() {
        calls.push('two')
      }

      emitter.on('foo', one)
      emitter.on('bar', two)

      emitter._emit('foo')
      emitter._emit('bar')

      emitter.removeAllListeners()

      emitter._emit('foo')
      emitter._emit('bar')

      expect(calls).toEqual(['one', 'two'])
    })

    it('off removes once subscriptions', function() {
      const emitter = new Emitter()
      const handler = jest.fn()

      emitter.once('foo', handler)
      emitter.once('fee', handler)
      emitter.off('foo', handler)

      emitter._emit('foo')

      expect(handler).not.toHaveBeenCalled()
    })
  })
})
