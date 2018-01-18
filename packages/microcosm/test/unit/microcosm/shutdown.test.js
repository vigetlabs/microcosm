import Microcosm, { patch } from 'microcosm'

describe('Shutting down a microcosm', function() {
  it('removes all listeners', function() {
    const repo = new Microcosm()

    repo.addDomain('colors', {
      register() {
        return {
          setColor: (a, b) => b
        }
      }
    })

    const listener = jest.fn()

    repo.answers.colors.subscribe(listener)
    listener.mockReset()

    repo.complete()
    repo.push('setColor', 'blue')

    expect(listener).toHaveBeenCalledTimes(0)
  })

  it('calls teardown on domains', function() {
    const repo = new Microcosm()
    const teardown = jest.fn()

    repo.addDomain('test', { teardown })
    repo.complete()

    expect(teardown).toHaveBeenCalled()
  })

  it('stops dispatching to domains', function() {
    const repo = new Microcosm()
    const register = jest.fn(n => ({}))

    repo.addDomain('test', { register })

    repo.complete()
    repo.push('test')

    expect(register).toHaveBeenCalledTimes(0)
  })

  it('stops dispatching to effects', function() {
    const repo = new Microcosm()
    const register = jest.fn(n => ({}))

    repo.addEffect({ register })

    repo.complete()
    repo.push('test')

    expect(register).toHaveBeenCalledTimes(0)
  })

  describe('forks', function() {
    it('tearing down eliminates parent subscriptions', function() {
      const parent = new Microcosm()
      const child = parent.fork()

      parent.addDomain('color', {})

      parent.push(patch, { color: 'red' })

      child.subscribe(() => {
        throw new Error('Should not have changed')
      })

      child.complete()

      parent.push(patch, { color: 'blue' })

      expect(parent.state.color).toEqual('blue')

      // Despite not sending out a change, state should be in sync
      expect(child.state.color).toEqual('blue')
    })
  })
})
