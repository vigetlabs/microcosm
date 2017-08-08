import { get } from '../../../src/utils'

describe('Utils.get', function() {
  const subject = {
    styles: {
      color: 'blue',
      font: 'Helvetica, sans-serif'
    }
  }

  it('can retrieve a single key', function() {
    let styles = get(subject, 'styles')

    expect(styles).toEqual(subject.styles)
  })

  it('can retrieve a deep key path', function() {
    let color = get(subject, ['styles', 'color'])

    expect(color).toEqual(subject.styles.color)
  })

  it('returns a fallback if the key is undefined', function() {
    let padding = get(subject, ['styles', 'padding'], 10)

    expect(padding).toEqual(10)
  })

  it('returns the fallback if the object is null', function() {
    let fallback = get(null, ['missing'], true)

    expect(fallback).toBe(true)
  })

  it('returns the value if there is no fallback and the value is null', function() {
    let value = get({ prop: null }, 'prop')

    expect(value).toBe(null)
  })

  it('returns the value if there is no fallback and the value is undefined', function() {
    let value = get({ prop: undefined }, 'prop')

    expect(value).toBe(undefined)
  })

  it('returns the fallback if the key and fallback are null', function() {
    let fallback = get(null, null, true)

    expect(fallback).toBe(true)
  })

  it('returns the fallback if a mid-way key is null', function() {
    let fallback = get({ a: { b: null } }, 'a.b.c', true)

    expect(fallback).toBe(true)
  })
})
