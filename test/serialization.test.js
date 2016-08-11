import test from 'ava'
import Microcosm from '../src/microcosm'

test('runs through serialize methods on stores', t => {
  const repo = new Microcosm()

  repo.addStore('serialize-test', {
    getInitialState() {
      return 'this will not display'
    },
    serialize() {
      return 'this is a test'
    }
  })

  t.is(repo.toJSON()['serialize-test'], 'this is a test')
})

test('sends all state as the second argument', t => {
  t.plan(1)

  const repo = new Microcosm()

  repo.addStore('serialize-test', {
    serialize(subset, state) {
      t.is(state, repo.state)
    }
  })

  repo.toJSON()
})

test('defaults to getInitialState when no deserialize method is provided', t => {
  t.plan(1)

  const repo = new Microcosm()

  repo.addStore('fiz', {
    getInitialState() {
      return true
    }
  })

  repo.replace({}).onDone(function() {
    t.deepEqual(repo.state, { fiz: true })
  })
})

test('passes the raw data as the seconda argument of deserialize', t => {
  t.plan(2)
  const repo = new Microcosm()

  repo.addStore('fiz', {
    deserialize(subset, raw) {
      t.is(subset, 'buzz')
      t.deepEqual(raw, { fiz: 'buzz' })
    }
  })

  repo.deserialize({ fiz: 'buzz'})
})
