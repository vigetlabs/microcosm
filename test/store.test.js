import test from 'ava'
import Microcosm from '../src/microcosm'

test('stores can be functions', t => {
  const repo = new Microcosm()

  repo.addStore('key', function() {
    return {
      getInitialState: () => true
    }
  })

  t.is(repo.state.key, true)
})

test('stores can be objects with lifecycle methods', t => {
  const repo = new Microcosm()

  repo.addStore('key', {
    getInitialState: () => true
  })

  t.is(repo.state.key, true)
})

test('throws if a registry contains an undefined key', t => {
  const repo = new Microcosm()

  // This will throw when added to a store because it will dispatch
  // "getInitialState"
  const badStore = function() {
    return {
      [undefined]: n => n
    }
  }

  t.throws(function() {
    repo.addStore('test', badStore)
  }, /\"undefined\" attribute within register/)
})

test('throws if a register handler is undefined', t => {
  const repo = new Microcosm()
  const action = n => n

  repo.addStore('key', function() {
    return {
      [action]: undefined
    }
  })

  t.throws(function() {
    repo.push(action)
  }, /Check the register method for this store/)
})
