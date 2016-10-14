import test from 'ava'
import Microcosm from '../src/microcosm'
import lifecycle from '../src/lifecycle'

const action = a => a

test('sends actions in the context of the domain', t => {
  t.plan(1)

  const repo = new Microcosm()

  repo.addDomain('test', {
    test: true,

    register() {
      return {
        [action]() {
          t.truthy(this.test)
        }
      }
    }
  })

  repo.push(action)
})

test('returns the same state if a handler is not provided', t => {
  t.plan(1)

  const repo = new Microcosm()

  repo.addDomain('test', {
    getInitialState() {
      return 'test'
    }
  })

  repo.push(action).onDone(function() {
    t.is(repo.state.test, 'test')
  })
})

test('allows lifecycle methods as registered actions', t => {
  const repo = new Microcosm()

  repo.addDomain('test', {
    register() {
      return {
        [lifecycle.getInitialState]: () => 'test'
      }
    }
  })

  t.is(repo.state.test, 'test')
})

test('does not trigger on implemented methods', t => {
  const repo = new Microcosm()

  repo.addDomain('test', {
    test() {
      throw new Error("Should not have invoked test method")
    }
  })

  repo.push('test')
})
