import Microcosm from '../src/microcosm'
import lifecycle from '../src/lifecycle'

const action = a => a

test('sends actions in the context of the domain', function (done) {
  const repo = new Microcosm()

  repo.addDomain('test', {
    test: true,

    register() {
      return {
        [action]() {
          expect(this.test).toBe(true)
          done()
        }
      }
    }
  })

  repo.push(action)
})

test('returns the same state if a handler is not provided', function () {
  const repo = new Microcosm()

  repo.addDomain('test', {
    getInitialState() {
      return 'test'
    }
  })

  return repo.push(action).onDone(function() {
    expect(repo.state.test).toEqual('test')
  })
})

test('allows lifecycle methods as registered actions', function () {
  const repo = new Microcosm()

  repo.addDomain('test', {
    register() {
      return {
        [lifecycle.getInitialState]: () => 'test'
      }
    }
  })

  expect(repo.state.test).toEqual('test')
})
