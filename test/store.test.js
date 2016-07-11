import test from 'ava'
import Store from '../src/store'
import Microcosm from '../src/microcosm'

test('overrides the register method when given a configuration', t => {
  const config = n => n
  const store = new Store(config)

  t.is(store.register, config)
})

test('injects its initial state when added to a microcosm', t => {
  const app = new Microcosm()

  app.addStore('key', {
    getInitialState: () => true
  })

  t.is(app.state.key, true)
})

test('throws if register contains an undefined key', t => {
  const store = new Store(function() {
    return {
      [undefined]: () => {}
    }
  })

  t.throws(function() {
    store.receive({}, { type: 'test' })
  }, /registry/)
})
