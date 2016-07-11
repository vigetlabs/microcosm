import test from 'ava'
import Microcosm from '../src/microcosm'

test('runs through serialize methods on stores', t => {
  const app = new Microcosm()

  app.addStore('serialize-test', {
    getInitialState() {
      return 'this will not display'
    },
    serialize() {
      return 'this is a test'
    }
  })

  t.is(app.toJSON()['serialize-test'], 'this is a test')
})

test('sends all state as the second argument', t => {
  t.plan(1)

  const app = new Microcosm()

  app.addStore('serialize-test', {
    serialize(subset, state) {
      t.is(state, app.state)
    }
  })

  app.toJSON()
})

test('defaults to getInitialState when no deserialize method is provided', t => {
  t.plan(1)

  const app = new Microcosm()

  app.addStore('fiz', {
    getInitialState() {
      return true
    }
  })

  app.replace({}).onDone(function() {
    t.deepEqual(app.state, { fiz: true })
  })
})

test('passes the raw data as the seconda argument of deserialize', t => {
  t.plan(2)
  const app = new Microcosm()

  app.addStore('fiz', {
    deserialize(subset, raw) {
      t.is(subset, 'buzz')
      t.deepEqual(raw, { fiz: 'buzz' })
    }
  })

  app.deserialize({ fiz: 'buzz'})
})
