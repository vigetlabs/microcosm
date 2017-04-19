import { clone } from '../../../src/utils'

describe('Utils.clone', function () {
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
