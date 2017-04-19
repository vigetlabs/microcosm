import { castPath } from '../../../src/key-path'

describe('castPath', function () {
  it('returns an empty array if given a blank string', function () {
    let path = castPath('')

    expect(path).toEqual([])
  })

  it('returns the same array if given an array', function () {
    let path = [1, 2, 3]
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
