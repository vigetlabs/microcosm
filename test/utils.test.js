import {
  castPath,
  merge,
  clone,
  get,
  set,
  update
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

  it('does not clone strings', function () {
    expect(clone('a')).toBe('a')
  })

  it('does not clone numbers', function () {
    expect(clone(1)).toBe(1)
  })

  it('does not clone booleans', function () {
    expect(clone(true)).toBe(true)
  })

  it('does not clone null', function () {
    expect(clone(null)).toBe(null)
  })

  it('does not clone undefined', function () {
    expect(clone(undefined)).toBe(undefined)
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

})

describe('castPath', function () {

  it('returns the same array if given an array', function () {
    let path = [1,2,3]
    let next = castPath(path)

    expect(next).toBe(path)
  })

  it('returns an empty array if given an null', function () {
    let next = castPath(null)

    expect(next).toEqual([])
  })

  it('returns an empty array if given an undefined', function () {
    let next = castPath(null)

    expect(next).toEqual([])
  })

  it('splits strings by dots', function () {
    let next = castPath('a.b.c')

    expect(next).toEqual(['a', 'b', 'c'])
  })

  it('handles numbers', function () {
    let next = castPath(1)

    expect(next).toEqual([1])
  })

})

describe('get', function () {
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

  it('can retrieve a deep key path', function () {
    let color = get(subject, ['styles', 'color'])

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

  it('can assign an empty path', function () {
    let value = set(subject, [], false)

    expect(value).toBe(false)
  })

  it('assigns undefined', function () {
    let next = set(subject, 'styles', undefined)

    expect(next.styles).toEqual(undefined)
  })

  it('can set a deep key', function () {
    let next = set(subject, ['styles', 'color'], 'red')

    expect(next.styles.color).toEqual('red')
  })

  it('can set a deep key using dot notation', function () {
    let next = set(subject, 'styles.color', 'red')

    expect(next.styles.color).toEqual('red')
  })

  it('can set new keys deeply', function () {
    let next = set(subject, ['styles', 'padding', 'top'], 10)

    expect(next.styles.padding.top).toEqual(10)
  })

  it('does not destructively update data', function () {
    let next = set(subject, ['styles', 'padding', 'top'], 10)

    expect(next).not.toBe(subject)
    expect(next.styles).not.toBe(subject.styles)
    expect(next.styles.padding).not.toBe(subject.styles.padding)
  })

  it('does not duplicate objects when the value is the same', function () {
    let next = set(subject, ['styles', 'color'], 'blue')

    expect(next).toBe(subject)
    expect(next.styles).toBe(subject.styles)
  })

  it('does modify the original value', function () {
    let next = set(subject, ['styles', 'color'], 'red')

    expect(subject.styles.color).toBe('blue')
    expect(next.styles.color).toBe('red')
  })

  describe('arrays', function () {

    it('can operate on arrays', function () {
      let list = ['a', 'b', 'c']
      let next = set(list, 3, 'd')

      expect(Array.isArray(next)).toBe(true)
      expect(next[3]).toBe('d')
    })


    it('properly assigns nested arrays', function () {
      let list = { 'a': ['b', 'c'] }
      let next = set(list, ['a', 1], 'd')

      expect(next).toEqual({ 'a' : ['b', 'd'] })
      expect(next['a']).toBeInstanceOf(Array)
    })

    it('properly assigns nested arrays where keys are missing', function () {
      let space = { 'planets': [] }
      let next = set(space, ['planets', 0, 'color'], 'red')

      expect(next).toEqual({ planets: [{ color: 'red' }] })
      expect(next['planets']).toBeInstanceOf(Array)
      expect(next['planets'][0]).toEqual({ color: 'red'})
    })
  })
})

describe('update', function () {
  const subject = {
    styles: {
      color: 'blue',
      font: 'Helvetica, sans-serif'
    }
  }

  it('updates a value in-place', function () {
    let next = update(subject, 'styles.color', color => color.toUpperCase())

    expect(next.styles.color).toEqual('BLUE')
  })

  it('can work from a fallback if a key is missing', function () {
    let next = update(subject, 'styles.padding', padding => padding += 10, 0)

    expect(next.styles.padding).toEqual(10)
  })

  it('can set a non-function value, proxying set', function () {
    let next = update(subject, 'styles.padding', 10)

    expect(next.styles.padding).toEqual(10)
  })

})
