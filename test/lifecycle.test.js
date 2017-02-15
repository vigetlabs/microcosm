import Microcosm from '../src/microcosm'

describe('Setup', function() {

  it('passes options from instantiation', function () {
    const test = jest.fn()

    class Repo extends Microcosm {
      get setup () {
        return test
      }
    }

    expect(new Repo({ foo: 'bar' }).setup).toHaveBeenCalledWith({ foo: 'bar' })
  })

})

describe('Teardown', function() {

  it('removes all listeners', function () {
    const repo = new Microcosm()

    const listener = jest.fn()

    repo.on('change', listener)

    repo.teardown()

    repo._emit('change')

    expect(listener).not.toHaveBeenCalled()
  })

  it('calls teardown on domains', function () {
    const repo = new Microcosm()
    const teardown = jest.fn()

    repo.addDomain('test', { teardown })
    repo.teardown()

    expect(teardown).toHaveBeenCalled()
  })

  it('removes the microcosm from its history', function () {
    const repo = new Microcosm()
    const child = repo.fork()

    child.teardown()

    expect(repo.history.repos).toEqual([repo])
  })

})
