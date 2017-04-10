import Microcosm from '../../../src/microcosm'

describe('Microcosm::shutdown', function () {

  it('removes all listeners', function () {
    const repo = new Microcosm()

    const listener = jest.fn()

    repo.on('change', listener)

    repo.shutdown()

    repo._emit('change')

    expect(listener).not.toHaveBeenCalled()
  })

  it('calls teardown on domains', function () {
    const repo = new Microcosm()
    const teardown = jest.fn()

    repo.addDomain('test', { teardown })
    repo.shutdown()

    expect(teardown).toHaveBeenCalled()
  })

  it('removes the microcosm from its history', function () {
    const repo = new Microcosm()
    const child = repo.fork()

    child.shutdown()

    jest.spyOn(child, 'release')

    repo.push(n => n)

    expect(child.release).not.toHaveBeenCalled()
  })

  describe('forks', function () {

    it('tearing down eliminates parent subscriptions', function () {
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
      expect(child.state.color).toEqual('red')
    })

  })

})
