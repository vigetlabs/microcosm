import Microcosm, { patch } from 'microcosm'

describe('Microcosm::patch', function() {
  it('only patches within managed keys', function() {
    const repo = new Microcosm()

    repo.addDomain('colors', {})

    repo.push(patch, { shapes: ['square', 'triangle', 'circle'] })

    expect(repo).not.toHaveState('shapes')
  })

  it('raises if there is a JSON parse error deserialization fails', function() {
    const repo = new Microcosm()

    // This is invalid
    let badPatch = () => repo.push(patch, '{ test }', true)

    expect(badPatch).toThrow()
  })

  describe('forks', function() {
    it('deeply inherits state', function() {
      const grandparent = new Microcosm()

      grandparent.addDomain('color', {})
      grandparent.push(patch, { color: 'red' })

      const parent = grandparent.fork()
      const child = parent.fork()

      expect(parent).toHaveState('color', 'red')
      expect(child).toHaveState('color', 'red')
    })

    it('does not cause forks to revert state', function() {
      const parent = new Microcosm()
      const child = parent.fork()

      child.addDomain('count', {
        register() {
          return {
            add: (a, b) => a + b
          }
        }
      })

      child.push(patch, { count: 2 })

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

    it('does not strip away parent inherited state', function() {
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

      child.push(patch, { bottom: true })

      expect(parent.state.top).toBe(true)
      expect(parent.state).not.toHaveProperty('bottom')

      expect(child.state.top).toEqual(true)
      expect(child.state.bottom).toEqual(true)
    })

    it('does not strip away parent inherited state when the parent patches', function() {
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

      parent.push(patch, { top: true })

      expect(parent).toHaveState('top', true)
      expect(child).toHaveState('top', true)
    })

    it('patching on a parent does not reset state of children', function() {
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

      parent.push(patch, { bottom: true })

      expect(parent).not.toHaveState('bottom')
      expect(child).toHaveState('bottom', false)
    })
  })
})
