import Observable from 'zen-observable'
import { find, filter, matches, reject, observerHash } from '../src/utilities'

describe('matches', function() {
  it('returns true if there are no criteria', function() {
    expect(matches({ id: 1 })).toBe(true)
  })

  it('returns true if there are no criteria keys', function() {
    expect(matches({ id: 1 }, {})).toBe(true)
  })
})

describe('find', function() {
  let bill = { id: 0, gender: 'M', name: 'Bill' }
  let fred = { id: 1, gender: 'M', name: 'Fred' }

  it('returns the first matching result', function() {
    expect(find([bill, fred], { gender: 'M' })).toBe(bill)
  })

  it('returns the first item when there are no criteria', function() {
    expect(find([bill, fred])).toBe(bill)
  })

  it('returns null when there is no match', function() {
    expect(find([bill, fred], { id: 2 })).toBe(null)
  })
})

describe('filter', function() {
  let bill = { id: 0, gender: 'M', name: 'Bill' }
  let fred = { id: 1, gender: 'M', name: 'Fred' }

  it('returns all matching results', function() {
    expect(filter([bill, fred], { gender: 'M' })).toEqual([bill, fred])
  })

  it('returns all items when there are no criteria', function() {
    expect(filter([bill, fred])).toEqual([bill, fred])
  })

  it('returns an empty list when there is no match', function() {
    expect(filter([bill, fred], { id: 2 })).toEqual([])
  })

  it('returns an empty list when there are no items or match', function() {
    expect(filter([], null)).toEqual([])
  })
})

describe('reject', function() {
  let bill = { id: 0, gender: 'M', name: 'Bill' }
  let fred = { id: 1, gender: 'M', name: 'Fred' }

  it('returns all items outside of the match', function() {
    expect(reject([bill, fred], { id: 0 })).toEqual([fred])
  })

  it('returns no items are no criteria', function() {
    expect(reject([bill, fred])).toEqual([])
  })
})

describe('hashObserverable', function() {
  function count(end) {
    let start = 0
    return new Observable(observer => {
      while (start <= end) {
        observer.next(start++)
      }
      observer.complete()
    })
  }

  it('builds an array', function() {
    let handler = jest.fn()

    observerHash([count(2), count(2)]).subscribe(handler)

    expect(handler).toHaveBeenCalledWith([0])
    expect(handler).toHaveBeenCalledWith([1])
    expect(handler).toHaveBeenCalledWith([2])
    expect(handler).toHaveBeenCalledWith([2, 0])
    expect(handler).toHaveBeenCalledWith([2, 1])
    expect(handler).toHaveBeenCalledWith([2, 2])
  })

  it('builds an object', function() {
    let handler = jest.fn()

    observerHash({
      one: count(2),
      two: count(2)
    }).subscribe(handler)

    expect(handler).toHaveBeenCalledWith({ one: 0 })
    expect(handler).toHaveBeenCalledWith({ one: 1 })
    expect(handler).toHaveBeenCalledWith({ one: 2 })
    expect(handler).toHaveBeenCalledWith({ one: 2, two: 0 })
    expect(handler).toHaveBeenCalledWith({ one: 2, two: 1 })
    expect(handler).toHaveBeenCalledWith({ one: 2, two: 2 })
  })
})
