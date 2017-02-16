import Microcosm from '../src/microcosm'

describe('serialize', function () {

  it('runs through serialize methods on domains', function () {
    const repo = new Microcosm()

    repo.addDomain('serialize-test', {
      getInitialState() {
        return 'this will not display'
      },
      serialize() {
        return 'this is a test'
      }
    })

    expect(repo.toJSON()['serialize-test']).toBe('this is a test')
  })

  it('only includes keys that impliment serialize', function () {
    const repo = new Microcosm()

    repo.addDomain('missing', {
      getInitialState () {
        return true
      }
    })

    repo.addDomain('included', {
      getInitialState () {
        return 'howdy'
      },
      serialize (state) {
        return state.toUpperCase()
      }
    })

    let json = repo.toJSON()

    expect(json.included).toEqual('HOWDY')
    expect(json.missing).not.toBeDefined()
  })

})

describe('deserialize', function () {

  it('to getInitialState when no deserialize method is provided', function () {
    const repo = new Microcosm()

    repo.addDomain('fiz', {
      getInitialState() {
        return true
      }
    })

    return repo.patch({}, true).onDone(function() {
      expect(repo).toHaveState('fiz', true)
    })
  })

  it('can deserialize a string', function () {
    const repo = new Microcosm()

    repo.addDomain('fiz', {
      deserialize (state) {
        return state.toUpperCase()
      }
    })

    let answer = repo.deserialize('{ "fiz": "buzz"}')

    expect(answer).toEqual({ fiz: 'BUZZ' })
  })

})

describe('parents', function () {

  it('serialize works from parents to children', function () {
    const parent = new Microcosm()
    const child = parent.fork()

    parent.addDomain('fiz', {
      getInitialState: () => 'fiz',
      serialize: word => word.toUpperCase()
    })

    child.addDomain('buzz', {
      getInitialState: () => 'buzz',
      serialize: word => word.toUpperCase()
    })

    expect(child.serialize()).toEqual({ fiz: 'FIZ', buzz: 'BUZZ' })
  })

  it('serializing a child with the same key works from that state', function () {
    const parent = new Microcosm()
    const child = parent.fork()

    parent.addDomain('fiz', {
      getInitialState: () => 'fiz',
      serialize: word => word + '-first'
    })

    child.addDomain('fiz', {
      serialize: word => word + '-second'
    })

    expect(child.serialize()).toEqual({ fiz: 'fiz-second' })
  })

  it('deserialize works from parents to children', function () {
    const parent = new Microcosm()
    const child = parent.fork()

    parent.addDomain('fiz', {
      deserialize: word => word.toLowerCase()
    })

    child.addDomain('buzz', {
      deserialize: word => word.toLowerCase()
    })

    const data = child.deserialize({ fiz: 'FIZ', buzz: 'BUZZ' })

    expect(data).toEqual({ fiz: 'fiz', buzz: 'buzz' })
  })

  it('deserializing a child with the same key works from serialization', function () {
    const parent = new Microcosm()
    const child = parent.fork()

    parent.addDomain('fiz', {
      deserialize: word => word + '-first'
    })

    child.addDomain('fiz', {
      deserialize: word => word + '-second'
    })

    const data = child.deserialize({ fiz: 'fiz' })

    expect(data).toEqual({ fiz: 'fiz-first-second' })
  })

})
