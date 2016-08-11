import test from 'ava'
import Microcosm from '../src/microcosm'

test('domains can be functions', t => {
  const app = new Microcosm()

  app.addDomain('key', function() {
    return {
      getInitialState: () => true
    }
  })

  t.is(app.state.key, true)
})

test('domains can be objects with lifecycle methods', t => {
  const app = new Microcosm()

  app.addDomain('key', {
    getInitialState: () => true
  })

  t.is(app.state.key, true)
})

test('throws if a registry contains an undefined key', t => {
  const app = new Microcosm()

  // This will throw when added to a domain because it will dispatch
  // "getInitialState"
  const badDomain = function() {
    return {
      [undefined]: n => n
    }
  }

  t.throws(function() {
    app.addDomain('test', badDomain)
  }, /\"undefined\" attribute within register/)
})

test('throws if a register handler is undefined', t => {
  const app = new Microcosm()
  const action = n => n

  app.addDomain('key', function() {
    return {
      [action]: undefined
    }
  })

  t.throws(function() {
    app.push(action)
  }, /Check the register method for this domain/)
})
