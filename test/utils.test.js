import {
  merge,
  clone,
  get,
  set
} from '../src/utils'

describe('clone', function () {

  it('can shallow copy an object', function () {
    let original = { id: '1' }
    let copy = clone(original)

    // It should match the original
    expect(copy).toEqual(original)

    // But it should not be the original
    expect(copy).not.toBe(original)
  })

  it('can shallow copy an array', function () {
    let original = [{ id: '1' }]
    let copy = clone(original)

    // It should not get coerced into an object
    expect(Array.isArray(copy)).toBe(true)

    // It should match the original
    expect(copy).toEqual(original)

    // It should not be the original
    expect(copy).not.toBe(original)
  })

})

describe('merge', function () {

  it('will not merge a null value into an object', function () {
    const a = {}
    const b = null

    expect(merge(a, b)).toBe(a)
  })

  it('will not merge a undefined into an object', function () {
    const a = {}
    const b = undefined

    expect(merge(a, b)).toBe(a)
  })

  it('works from the left most non-null value', function () {
    const a = null
    const b = {}

    expect(merge(a, b)).toBe(b)
  })

  it('does not copy even if the left most value is null', function () {
    const a = null
    const b = { foo: 'bar' }
    const c = { foo: 'bar' }

    expect(merge(a, b, c)).toBe(b)
  })

  it('merges many arguments', function () {
    const a = { red: true }
    const b = { green: true }
    const c = { blue: true }

    expect(merge(a, b, c)).toEqual({ red: true, green: true, blue: true })
  })

  it('ignores falsy middle arguments', function () {
    const a = { foo: 'bar' }
    const b = { foo: 'bar' }

    expect(merge(null, a, null, b)).toBe(a)
  })

  it('copys even with falsy middle arguments', function () {
    const a = { foo: 'bar' }
    const b = { foo: 'baz' }
    const c = merge(null, a, null, b)

    expect(c).not.toBe(a)
    expect(c).not.toBe(b)
    expect(c).toEqual(b)
  })

  it('handles subsequent null arguments', function () {
    const a = { foo: 'bar' }
    const b = { foo: 'baz' }
    const c = merge(null, null, a, b)

    expect(c).not.toBe(a)
    expect(c).not.toBe(b)
    expect(c).toEqual(b)
  })

  it('handles mixtures of undefined and null', function () {
    const a = { foo: 'bar' }
    const b = { foo: 'baz' }
    const c = merge(a, null, b, undefined)

    expect(c).not.toBe(a)
    expect(c).not.toBe(b)
    expect(c).toEqual(b)
  })

  describe('arrays', function () {
    it('merges arrays', function () {
      let answer = merge(['a'], ['b', 'c'])

      expect(answer).toEqual(['b', 'c'])
      expect(answer).toBeInstanceOf(Array)
    })

    it('does not copy arrays if it does not', function () {
      let first = ['a', 'b']
      let second = ['a']
      let answer = merge(first, second)

      expect(answer).toEqual(['a', 'b'])
      expect(answer).toBe(first)
    })
  })

})

describe.only('get', function () {
  const subject = {
    styles: {
      color: 'blue',
      font: 'Helvetica, sans-serif'
    }
  }

  it('can retrieve a single key', function () {
    let styles = get(subject, 'styles')

    expect(styles).toEqual(subject.styles)
  })

  it('fetches the root node when given null', function () {
    let styles = get(subject, null)

    expect(styles).toEqual(styles)
  })

  it('fetches the root node when given an empty string', function () {
    let styles = get(subject, '')

    expect(styles).toEqual(styles)
  })

  it('fetches the root node when given an empty array', function () {
    let styles = get(subject, [])

    expect(styles).toEqual(styles)
  })

  it('can retrieve a deep key path using an array', function () {
    let color = get(subject, ['styles', 'color'])

    expect(color).toEqual(subject.styles.color)
  })

  it('can retrieve a deep key path using dot notation', function () {
    let color = get(subject, 'styles.color')

    expect(color).toEqual(subject.styles.color)
  })

  it('returns a fallback if the key is undefined', function () {
    let padding = get(subject, ['styles', 'padding'], 10)

    expect(padding).toEqual(10)
  })

  it('returns the fallback if the object is null', function () {
    let fallback = get(null, ['missing'], true)

    expect(fallback).toBe(true)
  })

  it('returns the fallback if the key and fallback are null', function () {
    let fallback = get(null, null, true)

    expect(fallback).toBe(true)
  })

})

describe('set', function () {
  const subject = {
    styles: {
      color: 'blue',
      font: 'Helvetica, sans-serif'
    }
  }

  it('can set a single key', function () {
    let next = set(subject, 'styles', false)

    expect(next.styles).toEqual(false)
  })

  it('can set a deep key', function () {
    let next = set(subject, ['styles', 'color'], 'red')

    expect(next.styles.color).toEqual('red')
  })

  it('can set new keys deeply using an array', function () {
    let next = set(subject, ['styles', 'padding', 'top'], 10)

    expect(next.styles.padding.top).toEqual(10)
  })

  it('can set new keys deeply using dot notation', function () {
    let next = set(subject, 'styles.padding.top', 10)

    expect(next.styles.padding.top).toEqual(10)
  })

  it('does not destructively update data', function () {
    let next = set(subject, ['styles', 'padding', 'top'], 10)

    expect(next).not.toBe(subject)
    expect(next.styles).not.toBe(subject.styles)
  })

  it('does not duplicate objects when the value is the same', function () {
    let next = set(subject, ['styles', 'color'], 'blue')

    expect(next).toBe(subject)
  })

  it('can operate on arrays', function () {
    let list = { pixels: [[0,0,0],[0,0,0],[0,0,0]]}
    let next = set(list, ['pixels',2,2], 1)

    expect(Array.isArray(next.pixels)).toBe(true)
    expect(Array.isArray(next.pixels[2])).toBe(true)
    expect(next.pixels[2][2]).toBe(1)
  })
})
