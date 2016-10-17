import Microcosm from '../src/microcosm'

describe('Setup', function() {

  test('runs when a Microcosm is instantiated', function () {
    const test = jest.fn()

    class Repo extends Microcosm {
      get setup () {
        return test
      }
    }

    expect(new Repo().setup).toHaveBeenCalled()
  })

})

describe('Teardown', function() {

  test('removes all listeners', function () {
    const repo = new Microcosm()
    const other = new Microcosm()
    const listener = jest.fn()

    repo.on('change', listener)

    repo.teardown()

    repo._emit('change')

    expect(listener).not.toHaveBeenCalled()
  })

  test('calls teardown on domains', function () {
    const repo = new Microcosm()
    const teardown = jest.fn()

    repo.addDomain('test', { teardown })
    repo.teardown()

    expect(teardown).toHaveBeenCalled()
  })

  test('removes the microcosm from its history', function () {
    const repo = new Microcosm()
    const child = repo.fork()

    child.teardown()

    expect(repo.history.repos).toEqual([repo])
  })

})
