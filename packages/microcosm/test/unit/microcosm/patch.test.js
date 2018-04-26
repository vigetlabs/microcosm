import Microcosm, { patch } from 'microcosm'

describe('Microcosm::patch', function() {
  it('only patches within managed keys', async () => {
    const repo = new Microcosm()

    repo.addDomain('colors', {})

    await repo.push(patch, { shapes: ['square', 'triangle', 'circle'] })

    expect(repo).not.toHaveState('shapes')
  })

  it('raises if there is a JSON parse error deserialization fails', function() {
    const repo = new Microcosm()

    // This is invalid
    let badPatch = () => repo.push(patch, '{ test }', true)

    expect(badPatch).toThrow()
  })

  it('uses the deserialize method on domains', async () => {
    const repo = new Microcosm()

    repo.addDomain('caps', {
      deserialize(data) {
        return data.toUpperCase()
      }
    })

    await repo.push(patch, JSON.stringify({ caps: 'hello' }), true)

    expect(repo.state.caps).toEqual('HELLO')
  })

  it('just passes data through if no serialization method is provided', async () => {
    const repo = new Microcosm()

    repo.addDomain('count', {})

    await repo.push(patch, JSON.stringify({ count: 0 }), true)

    expect(repo.state.count).toEqual(0)
  })

  describe('forks', function() {
    it('deeply inherits state', async () => {
      const grandparent = new Microcosm()

      grandparent.addDomain('color', {})

      await grandparent.push(patch, { color: 'red' })

      const parent = grandparent.fork()
      const child = parent.fork()

      expect(parent).toHaveState('color', 'red')
      expect(child).toHaveState('color', 'red')
    })

    it('does not cause forks to revert state', async () => {
      const parent = new Microcosm()
      const child = parent.fork()

      child.addDomain('count', {
        register() {
          return {
            add: (a, b) => a + b
          }
        }
      })

      await child.push(patch, { count: 2 })
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

    it('does not strip away parent inherited state', async () => {
      const parent = new Microcosm()
      const child = parent.fork()

      parent.addDomain('top', {
        getInitialState() {
          return true
        }
      })

      child.addDomain('bottom', {
        getInitialState() {
          return false
        }
      })

      await child.push(patch, { bottom: true })

      expect(parent.state.top).toBe(true)
      expect(parent.state).not.toHaveProperty('bottom')

      expect(child.state.top).toEqual(true)
      expect(child.state.bottom).toEqual(true)
    })

    it('does not strip away parent inherited state when the parent patches', async () => {
      const parent = new Microcosm()
      const child = parent.fork()

      parent.addDomain('top', {
        getInitialState() {
          return false
        }
      })

      child.addDomain('bottom', {
        getInitialState() {
          return false
        }
      })

      await parent.push(patch, { top: true })

      expect(parent).toHaveState('top', true)
      expect(child).toHaveState('top', true)
    })

    it('patching on a parent does not reset state of children', async () => {
      const parent = new Microcosm()
      const child = parent.fork()

      parent.addDomain('top', {
        getInitialState() {
          return false
        }
      })

      child.addDomain('bottom', {
        getInitialState() {
          return false
        }
      })

      await parent.push(patch, { bottom: true })

      expect(parent).not.toHaveState('bottom')
      expect(child).toHaveState('bottom', false)
    })
  })
})
