import {
  clone,
  get,
  set,
  compileKeyPaths,
  extract
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

  it('can set a deep key', function () {
    let next = set(subject, ['styles', 'color'], 'red')

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
  })

  it('does not duplicate objects when the value is the same', function () {
    let next = set(subject, ['styles', 'color'], 'blue')

    expect(next).toBe(subject)
  })

  it('can operate on arrays', function () {
    let list = ['a', 'b', 'c']
    let next = set(list, 3, 'd')

    expect(Array.isArray(next)).toBe(true)
    expect(next[3]).toBe('d')
  })
})

describe('compileKeyPaths', function () {

  it('trims leading whitespaces', function () {
    let keyPaths = compileKeyPaths('foo.bar ,bip')

    expect(keyPaths).toEqual([
      ['foo', 'bar'],
      ['bip']
    ])
  })

  it('trims following whitespaces', function () {
    let keyPaths = compileKeyPaths('foo.bar, bip')

    expect(keyPaths).toEqual([
      ['foo', 'bar'],
      ['bip']
    ])
  })

})

describe('extract', function () {
  const subject = {
    styles: {
      color: 'blue',
      font: 'Helvetica, sans-serif'
    }
  }

  it('plucks a fragment of state', function () {
    let fragment = extract(subject, [['styles','color']])

    expect(fragment).toEqual({
      styles: {
        color: 'blue'
      }
    })
  })

  it('can seed another object', function () {
    let seed = { test: true }
    let fragment = extract(subject, [['styles','color']], seed)

    expect(fragment).toEqual({
      test: true,
      styles: {
        color: 'blue'
      }
    })

    expect(seed.styles).toBeUndefined()
  })

  it('seeding the result returns the same', function () {
    let seed = { test: true }
    let one = extract(subject, [['styles','color']], seed)
    let two = extract(subject, [['styles','color']], one)

    expect(one).toBe(two)
  })
})
