import test from 'ava'
import Microcosm from '../src/microcosm'
import console from './helpers/console'

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

test('warns if a register handler is undefined', t => {
  const repo = new Microcosm()
  const action = n => n

  console.record()

  repo.addStore('key', function() {
    return {
      [action]: undefined
    }
  })

  repo.push(action)

  t.is(console.count('warn'), 1)

  console.restore()
})
