import { getKeyPaths } from '../../../src/key-path'

describe('getKeyPaths', function() {
  it('removes leading spaces between paths', function() {
    let path = getKeyPaths('foo, bar')

    expect(path.length).toBe(2)

    expect(path[0]).toEqual(['foo'])
    expect(path[1]).toEqual(['bar'])
  })

  it('removes trailing spaces between paths', function() {
    let path = getKeyPaths('foo ,bar')

    expect(path.length).toBe(2)

    expect(path[0]).toEqual(['foo'])
    expect(path[1]).toEqual(['bar'])
  })

  it('removes spaces at the beginning of a path', function() {
    let path = getKeyPaths(' foo,bar')

    expect(path.length).toBe(2)

    expect(path[0]).toEqual(['foo'])
    expect(path[1]).toEqual(['bar'])
  })

  it('removes spaces at the end of a path', function() {
    let path = getKeyPaths('foo,bar ')

    expect(path.length).toBe(2)

    expect(path[0]).toEqual(['foo'])
    expect(path[1]).toEqual(['bar'])
  })

  it('does not remove space between words', function() {
    let path = getKeyPaths('foo, b ar')

    expect(path.length).toBe(2)

    expect(path[0]).toEqual(['foo'])
    expect(path[1]).toEqual(['b ar'])
  })
})
