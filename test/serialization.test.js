import Microcosm from '../src/microcosm'

test('runs through serialize methods on domains', function () {
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

test('defaults to getInitialState when no deserialize method is provided', function () {
  const repo = new Microcosm()

  repo.addDomain('fiz', {
    getInitialState() {
      return true
    }
  })

  return repo.patch({}).onDone(function() {
    expect(repo.state).toEqual({ fiz: true })
  })
})

test('passes the raw data as the second argument of deserialize', function (done) {
  const repo = new Microcosm()

  repo.addDomain('fiz', {
    deserialize(subset, raw) {
      expect(subset).toEqual('buzz')
      expect(raw).toEqual({ fiz: 'buzz' })
      done()
    }
  })

  repo.deserialize({ fiz: 'buzz'})
})

describe('parents', function () {

  test('serialize works from parents to children', function () {
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

  test('serializing a child with the same key works from serialization', function () {
    const parent = new Microcosm()
    const child = parent.fork()

    parent.addDomain('fiz', {
      getInitialState: () => 'fiz',
      serialize: word => word + '-first'
    })

    child.addDomain('fiz', {
      serialize: word => word + '-second'
    })

    expect(child.serialize()).toEqual({ fiz: 'fiz-first-second' })
  })

  test('deserialize works from parents to children', function () {
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

  test('deserializing a child with the same key works from serialization', function () {
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
