import test from 'ava'
import Microcosm from '../src/microcosm'
import lifecycle from '../src/lifecycle'

const action = a => a

test('sends actions in the context of the store', t => {
  t.plan(1)

  const app = new Microcosm()

  app.addStore('test', {
    test: true,

    register() {
      return {
        [action]() {
          t.truthy(this.test)
        }
      }
    }
  })

  app.push(action)
})

test('returns the same state if a handler is not provided', t => {
  t.plan(1)

  const app = new Microcosm()

  app.addStore('test', {
    getInitialState() {
      return 'test'
    }
  })

  app.push(action).onDone(function() {
    t.is(app.state.test, 'test')
  })
})

test('allows defined lifecycle methods to bypass the register function', t => {
  const app = new Microcosm()

  app.addStore('test', {
    getInitialState() {
      return 'test'
    }
  })

  const state = app.dispatch({}, { type: lifecycle.willStart })

  t.is(state.test, 'test')
})

test('allows lifecycle methods as registered actions', t => {
  const app = new Microcosm()

  app.addStore('test', {
    register() {
      return {
        [lifecycle.willStart]: () => 'test'
      }
    }
  })

  t.is(app.state.test, 'test')
})
