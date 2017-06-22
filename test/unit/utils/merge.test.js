import { merge } from '../../../src/utils'

describe('Utils.merge', function() {
  it('will not merge a null value into an object', function() {
    const a = {}
    const b = null

    expect(merge(a, b)).toBe(a)
  })

  it('will not merge a undefined into an object', function() {
    const a = {}
    const b = undefined

    expect(merge(a, b)).toBe(a)
  })

  it('works from the left most non-null value', function() {
    const a = null
    const b = {}

    expect(merge(a, b)).toBe(b)
  })

  it('does not copy even if the left most value is null', function() {
    const a = null
    const b = { foo: 'bar' }
    const c = { foo: 'bar' }

    expect(merge(a, b, c)).toBe(b)
  })

  it('returns a new copy when the left most value is an empty object', function() {
    const a = {}
    const b = { foo: 'bar' }

    const answer = merge(a, b)

    expect(answer).not.toBe(b)
    expect(answer).toEqual(b)
  })

  it('merges many arguments', function() {
    const a = { red: true }
    const b = { green: true }
    const c = { blue: true }

    expect(merge(a, b, c)).toEqual({ red: true, green: true, blue: true })
  })

  it('ignores falsy middle arguments', function() {
    const a = { foo: 'bar' }
    const b = { foo: 'bar' }

    expect(merge(null, a, null, b)).toBe(a)
  })

  it('copies even with falsy middle arguments', function() {
    const a = { foo: 'bar' }
    const b = { foo: 'baz' }
    const c = merge(null, a, null, b)

    expect(c).toEqual(b)
  })

  it('handles subsequent null arguments', function() {
    const a = { foo: 'bar' }
    const b = { foo: 'baz' }
    const c = merge(null, null, a, b)

    expect(c).not.toBe(b)
    expect(c).toEqual(b)
  })

  it('handles mixtures of undefined and null', function() {
    const a = { green: true }
    const b = { blue: true }
    const c = merge(a, null, b, undefined)

    expect(c).not.toBe(a)
    expect(c).not.toBe(b)
    expect(c).toEqual({ green: true, blue: true })
  })

  it('when there are no unique keys, it returns the last object', function() {
    const a = { foo: 'bar' }
    const b = { foo: 'baz' }
    const c = merge(a, null, b, undefined)

    expect(c).not.toBe(a)
    expect(c).toEqual(b)
  })

  it('returns the last object when the left most value is a superset', function() {
    const a = { red: true }
    const b = { red: true, green: true }
    const c = merge(a, null, b, undefined)

    expect(c).not.toBe(a)
    expect(c).toEqual(b)
  })

  it('returns a new object when the last object is not a superset', function() {
    const a = { red: false, blue: true }
    const b = { red: true, green: true }
    const c = merge(a, null, b, undefined)

    expect(c).toEqual({ red: true, green: true, blue: true })
  })

  it('uses the right value when it is a superset of the left', function() {
    const a = { red: true, green: true, blue: true }
    const b = { red: true, green: true }
    const c = merge(a, b)

    expect(c).toBe(a)
  })

  it('an empty object does not cause keys to drop', function() {
    const a = { color: 'red' }
    const b = {}

    expect(merge(a, b)).toBe(a)
  })

  it('undefined in the middle of different keys does not cause keys to drop', function() {
    const a = { parent: null, maxHistory: 0, batch: false }
    const b = undefined
    const c = { parent: true }

    expect(merge(a, b, c)).toEqual({
      parent: true,
      maxHistory: 0,
      batch: false
    })
  })

  describe('arrays', function() {
    it('merges a larger array into a smaller array', function() {
      let answer = merge([1, 2], [1, 2, 3])

      expect(Array.isArray(answer)).toBe(true)

      expect(answer).toEqual([1, 2, 3])
    })

    it('merges a smaller array into a larger array', function() {
      let answer = merge([1, 2, 3], [1, 2])

      expect(Array.isArray(answer)).toBe(true)

      expect(answer).toEqual([1, 2, 3])
    })
  })
})
