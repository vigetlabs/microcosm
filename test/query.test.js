import state from './fixtures/solar-system'
import Query from '../src/addons/query'
import { set } from '../src/microcosm'

describe('get', function () {

  it('fetches a value', function () {
    let query = new Query().get('physics.gravity')

    expect(query.compute(state)).toEqual(1)
  })

  it('can provide a fallback a value', function () {
    let query = new Query().get('physics.heat', 10)

    expect(query.compute(state)).toEqual(10)
  })

  it('can nest arguments', function () {
    let query = new Query().get('physics.gravity')

    expect(query.compute(state)).toEqual(1)
  })

  it('gracefully handles recomputing missing keys', function () {
    let query = new Query().get('physics.foo.bar')

    query.compute(state)
    query.compute(state)
  })

  it('aliases to query.select', function () {
    let query = new Query().select('physics.foo.bar', 10)

    let answer = query.compute(state)

    expect(answer).toEqual(10)
  })

})

describe('tap', function () {

  it('executes a function', function () {
    let query = new Query().get('physics.gravity').tap(n => n * 10)

    expect(query.compute(state)).toEqual(10)
  })

})

describe('filter', function () {
  it('reduces a data set given a predicate', function () {
    let query = new Query().get('planets').filter(planet => planet.id === 'pluto').map(i => i.id)

    expect(query.compute(state)).toEqual(['pluto'])
  })

  it('always returns the same array if the data has not changed', function () {
    let query = new Query().get('planets').filter(planet => planet.id === 'pluto').map(i => i.id)

    let a = query.compute(state)
    let b = query.compute(state)

    expect(a).toBe(b)
  })
})

describe('at', function () {
  it('gets an item at an index', function () {
    let query = new Query().get('planets').at(0).get('id')

    expect(query.compute(state)).toEqual('mercury')
  })

  it('gets an item from the back of the list', function () {
    let query = new Query().get('planets').at(-1).get('id')

    expect(query.compute(state)).toEqual('pluto')
  })

  it('returns undefined if out of the lower boundary', function () {
    let query = new Query().get('planets').at(-10)

    expect(query.compute(state)).toBeUndefined()
  })

  it('returns undefined if out of the upper boundary', function () {
    let query = new Query().get('planets').at(10)

    expect(query.compute(state)).toBeUndefined()
  })
})

describe('join', function () {
  it('filters by a criteria within the dataset', function () {
    let query = new Query().get('planets').join('id', 'meta.selected').at(0).get('id')

    expect(query.compute(state)).toEqual('venus')
  })

  it('always returns the same array if the data has not changed', function () {
    let query = new Query().get('planets').join('id', 'meta.selected')

    let a = query.compute(state)
    let b = query.compute(state)

    expect(a).toBe(b)
  })
})

describe('memoization', function () {

  it('memoizes on state', function () {
    let query = new Query().get('physics')

    expect(query.compute(state)).toBe(query.compute(state))
  })

  it('ignores unrelated keys', function () {
    let query = new Query().get('planets').join('id', 'meta.selected')

    let copy = set(state, 'meta.heat', 9000)

    expect(query.compute(state)).toBe(query.compute(copy))
  })

  it('busts if values are different', function () {
    let query = new Query().get('planets').join('id', 'meta.selected')

    let copy = set(state, 'meta.selected', 'earth')

    expect(query.compute(state)).not.toBe(query.compute(copy))
  })

  it('filter never a new array for the same data', function () {
    let query = new Query().get('planets').filter(planet => planet.color === 'brown')

    let copy = set(state, 'planets', state.planets.slice(0))

    expect(query.compute(state)).toBe(query.compute(copy))
  })

  it('where never returns a new array for the same data', function () {
    let query = new Query().get('planets').filter(p => p.color === 'brown')

    let copy = set(state, 'planets', state.planets.slice(0))

    expect(query.compute(state)).toBe(query.compute(copy))
  })

  it('join never returns a new array for the same data', function () {
    let query = new Query().get('planets').join('id', 'meta.selected')

    let copy = set(state, 'planets', state.planets.slice(0))

    expect(query.compute(state)).toBe(query.compute(copy))
  })

  it('returns the same result as ancestor queries', function () {
    let query = new Query()
    let first = query.get('planets').filter(n => n.orbit > 365)
    let second = first.get([])

    expect(first.compute(state)).toBe(second.compute(state))
  })

  it('only computes parent state once', function () {
    let processor = jest.fn(n => n)
    let query = new Query().tap(processor)

    let first = query.get('planets').filter(n => n.orbit > 365)
    let second = first.get([])

    first.compute(state)
    second.compute(state)

    expect(processor).toHaveBeenCalledTimes(1)
  })

  it('only computes chained values state once', function () {
    let longOrbit = jest.fn(planets => planets.filter(n => n.orbit > 365))
    let query = new Query().get('planets')

    let first = query.tap(longOrbit)
    let second = first.at(0).get('id')

    first.compute(state)
    let id = second.compute(state)

    expect(longOrbit).toHaveBeenCalledTimes(1)
    expect(id).toEqual('mars')
  })

  it('dependencies of a child do not bust the calculation of the parent', function () {
    let query = new Query().get('meta.selected')
    let child = query.get('meta')

    expect(query.tracking).toEqual([['meta', 'selected']])
    expect(child.tracking).toEqual([['meta']])
  })

})

describe('shouldChange', function () {

  describe('join', function () {
    it('catches related keys', function () {
      let query = new Query().get('planets').join('id', 'meta.selected')

      query.compute(state)

      let copy = set(state, 'meta.selected', 'pluto')

      expect(query.shouldChange(copy)).toBe(true)
    })

    it('ignores unrelated keys', function () {
      let query = new Query().get('planets').join('id', 'meta.selected')

      query.compute(state)

      let copy = set(state, 'meta.heat', 9000)

      expect(query.shouldChange(copy)).toBe(false)
    })
  })

})
