import { set } from 'microcosm'

describe('Utils.set', function() {
  const subject = {
    styles: {
      color: 'blue',
      font: 'Helvetica, sans-serif'
    }
  }

  it('can set a single key', function() {
    let next = set(subject, 'styles', false)

    expect(next.styles).toEqual(false)
  })

  it('can assign an empty path', function() {
    let value = set(subject, [], false)

    expect(value).toBe(false)
  })

  it('assigns undefined', function() {
    let next = set(subject, 'styles', undefined)

    expect(next.styles).toEqual(undefined)
  })

  it('can set a deep key', function() {
    let next = set(subject, ['styles', 'color'], 'red')

    expect(next.styles.color).toEqual('red')
  })

  it('can set a deep key using dot notation', function() {
    let next = set(subject, 'styles.color', 'red')

    expect(next.styles.color).toEqual('red')
  })

  it('can set new keys deeply', function() {
    let next = set(subject, ['styles', 'padding', 'top'], 10)

    expect(next.styles.padding.top).toEqual(10)
  })

  it('does not destructively update data', function() {
    let next = set(subject, ['styles', 'padding', 'top'], 10)

    expect(next).not.toBe(subject)
    expect(next.styles).not.toBe(subject.styles)
    expect(next.styles.padding).not.toBe(subject.styles.padding)
  })

  it('does not duplicate objects when the value is the same', function() {
    let next = set(subject, ['styles', 'color'], 'blue')

    expect(next).toBe(subject)
    expect(next.styles).toBe(subject.styles)
  })

  it('does modify the original value', function() {
    let next = set(subject, ['styles', 'color'], 'red')

    expect(subject.styles.color).toBe('blue')
    expect(next.styles.color).toBe('red')
  })

  it('assigns over an existing nested object', function() {
    let next = set({ root: true }, ['root', 'segment'], true)

    expect(next.root).toEqual({ segment: true })
  })

  it('removes undefined keys', function() {
    let next = set({ prop: true }, 'prop', undefined)

    expect(next).not.toHaveProperty('root')
  })

  it('removes deeply nested keys', function() {
    let next = set({ a: { b: true } }, 'a.b', undefined)

    expect(next).not.toHaveProperty('a.b')
  })

  it('respects other keys keys', function() {
    let next = set({ a: { b: true, c: true } }, 'a.b', undefined)

    expect(next).not.toHaveProperty('a.b')
    expect(next).toHaveProperty('a.c')
  })

  it('does not create garbage when setting a value to undefined', function() {
    let next = set({}, 'a.b.c', undefined)

    expect(next).not.toHaveProperty('a')
  })

  describe('arrays', function() {
    it('can operate on arrays', function() {
      let list = ['a', 'b', 'c']
      let next = set(list, 3, 'd')

      expect(Array.isArray(next)).toBe(true)
      expect(next[3]).toBe('d')
    })

    it('properly assigns nested arrays', function() {
      let list = { a: ['b', 'c'] }
      let next = set(list, ['a', 1], 'd')

      expect(next).toEqual({ a: ['b', 'd'] })
      expect(next['a']).toBeInstanceOf(Array)
    })

    it('properly assigns nested arrays where keys are missing', function() {
      let space = { planets: [] }
      let next = set(space, ['planets', 0, 'color'], 'red')

      expect(next).toEqual({ planets: [{ color: 'red' }] })
      expect(next['planets']).toBeInstanceOf(Array)
      expect(next['planets'][0]).toEqual({ color: 'red' })
    })
  })
})
