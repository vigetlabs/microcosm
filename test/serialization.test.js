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
