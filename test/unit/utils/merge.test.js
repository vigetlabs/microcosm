import {
  merge
} from '../../../src/utils'

describe('Utils.merge', function () {

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
