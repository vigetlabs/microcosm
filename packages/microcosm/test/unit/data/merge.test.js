import { merge } from 'microcosm'

describe('Utils.merge', function() {
  let skippable = [true, false, undefined, 0, 10, 'string']

  skippable.forEach(function(type) {
    describe(`When mixing ${type}`, function() {
      const subject = { id: 0 }
      const empty = {}

      it(`skips ${type} on the left`, function() {
        expect(merge(type, type, subject)).toBe(subject)
      })

      it(`skips ${type} on the right`, function() {
        expect(merge(subject, type, type)).toBe(subject)
      })

      it(`skips ${type} on the both ends`, function() {
        expect(merge(type, subject, type)).toBe(subject)
      })

      it(`skips ${type} when an object has no keys`, function() {
        expect(merge(type, empty, type)).toBe(empty)
      })
    })
  })

  it('returns an extensible object - not the EMPTY_OBJECT constant', function() {
    let answer = merge()
    expect(Object.isExtensible(answer)).toBe(true)
  })

  it('returns a new copy when the left most value is an empty object', function() {
    const a = {}
    const b = { foo: 'bar' }

    const answer = merge(a, b)

    expect(answer).not.toBe(b)
    expect(answer).toEqual(b)
  })

  it('the same object when merging an empty object', function() {
    const a = { foo: 'bar' }
    const b = {}

    const answer = merge(a, b)

    expect(answer).toBe(a)
  })

  it('merges many arguments', function() {
    const a = { red: true }
    const b = { green: true }
    const c = { blue: true }

    expect(merge(a, b, c)).toEqual({ red: true, green: true, blue: true })
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
