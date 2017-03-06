import Microcosm from '../../../src/microcosm'

describe('Microcosm::reset', function () {

  it('reset returns to initial state', function () {
    const repo = new Microcosm()

    repo.addDomain('test', {
      getInitialState: () => false
    })

    repo.patch({ test: true })

    expect(repo).toHaveState('test', true)

    repo.reset()

    expect(repo).toHaveState('test', false)
  })

  it('only resets within managed keys', function () {
    const repo = new Microcosm()

    repo.addDomain('colors', {})

    repo.reset({ shapes: ['square', 'triangle', 'circle'] })

    expect(repo).not.toHaveState('shapes')
  })

  it('rejects if there is a JSON parse error deserialization fails', function () {
    const repo = new Microcosm()

    // This is invalid
    let badPatch = repo.reset("{ test: deserialize }", true)

    expect(badPatch).toHaveStatus('error')
  })

  it('preserves state if reset fails', function () {
    const repo = new Microcosm()

    repo.addDomain('test', {
      getInitialState: () => true
    })

    expect(repo).toHaveState('test', true)

    repo.patch({ test: false })

    expect(repo).toHaveState('test', false)

    // This is invalid
    repo.reset("{ test: deserialize }", true)

    expect(repo).toHaveState('test', false)
  })

  describe('forks', function () {

    it('forks inherit state on reset', function () {
      const parent = new Microcosm()
      const child = parent.fork()

      parent.addDomain('foo', {})

      parent.reset({ foo: 'bar' })

      expect(child).toHaveState('foo', 'bar')
    })

    it('reset does not cause forks to revert state', function () {
      const parent = new Microcosm()
      const child = parent.fork()

      child.addDomain('count', {
        register () {
          return {
            'add' : (a, b) => a + b
          }
        }
      })

      child.reset({ count: 2 })

      child.push('add', 1)
      child.push('add', 1)

      // Forks inherit state. If a parent repo's state contains a key, it will
      // pass the associated value down to a child. This allows state to flow
      // downward through the repo network.
      //
      // Unfortunately, this causes an unexpected behavior with `patch` where
      // consecutive actions always operate on the original patched value, and not
      // the new state produced by a child.
      expect(child.state.count).toEqual(4)
    })

  })

})
