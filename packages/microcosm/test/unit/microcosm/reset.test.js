import { Microcosm, reset, patch } from 'microcosm'

describe('Microcosm::reset', function() {
  it('reset returns to initial state', async () => {
    const repo = new Microcosm()

    repo.addDomain('test', {
      getInitialState: () => false
    })

    await repo.push(patch, { test: true })

    expect(repo).toHaveState('test', true)

    await repo.push(reset)

    expect(repo).toHaveState('test', false)
  })

  it('only resets within managed keys', async () => {
    const repo = new Microcosm()

    repo.addDomain('colors', {})

    await repo.push(reset, { shapes: ['square', 'triangle', 'circle'] })

    expect(repo).not.toHaveState('shapes')
  })

  it('raises if there is a JSON parse error deserialization fails', () => {
    const repo = new Microcosm()

    // This is invalid
    let badPatch = () => repo.push(reset, '{ test: deserialize }', true)

    expect(badPatch).toThrow()
  })

  it('preserves state if reset fails', async () => {
    const repo = new Microcosm()

    repo.addDomain('test', {
      getInitialState: () => true
    })

    expect(repo).toHaveState('test', true)

    await repo.push(patch, { test: false })

    expect(repo).toHaveState('test', false)

    try {
      await repo.push(reset, '{ test: badJson }', true)
    } catch (x) {
      // do not handle this error
    }

    expect(repo).toHaveState('test', false)
  })

  describe('forks', () => {
    it('forks inherit state on reset', async () => {
      const parent = new Microcosm()
      const child = parent.fork()

      parent.addDomain('foo', {})

      await parent.push(reset, { foo: 'bar' })

      expect(child).toHaveState('foo', 'bar')
    })

    it('reset does not cause forks to revert state', async () => {
      const parent = new Microcosm()
      const child = parent.fork()

      child.addDomain('count', {
        register() {
          return {
            add: (a, b) => a + b
          }
        }
      })

      await child.push(reset, { count: 2 })
      await child.push('add', 1)
      await child.push('add', 1)

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
