import Microcosm from 'microcosm'

describe('Microcosm::shutdown', function() {
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

    repo.on('change', listener)

    repo.shutdown()

    repo.append('setColor').resolve('blue')

    expect(listener).not.toHaveBeenCalled()
  })

  it('calls teardown on domains', function() {
    const repo = new Microcosm()
    const teardown = jest.fn()

    repo.addDomain('test', { teardown })
    repo.shutdown()

    expect(teardown).toHaveBeenCalled()
  })

  it('removes the microcosm from its history', function() {
    const repo = new Microcosm()
    const register = jest.fn()

    repo.addEffect({ register })

    repo.push('test')
    repo.shutdown()

    repo.append('test', 'resolve')

    expect(register).toHaveBeenCalledTimes(1)
  })

  describe('forks', function() {
    it('tearing down eliminates parent subscriptions', function() {
      const parent = new Microcosm()
      const child = parent.fork()

      parent.addDomain('color', {})

      parent.patch({ color: 'red' })

      child.on('change', function() {
        throw new Error('Should not have changed')
      })

      child.shutdown()

      parent.patch({ color: 'blue' })

      expect(parent.state.color).toEqual('blue')
    })
  })
})
