import Microcosm from '../../../src/microcosm'

describe('Microcosm::patch', function () {

  it('only patches within managed keys', function () {
    const repo = new Microcosm()

    repo.addDomain('colors', {})

    repo.patch({ shapes: ['square', 'triangle', 'circle'] })

    expect(repo).not.toHaveState('shapes')
  })

  it('rejects if there is a JSON parse error deserialization fails', function () {
    const repo = new Microcosm()

    // This is invalid
    let badPatch = repo.patch("{ test: deserialize }", true)

    expect(badPatch).toHaveStatus('error')
  })

  describe('forks', function () {

    it('deeply inherits state', function () {
      const tree = new Microcosm({ maxHistory: Infinity })

      tree.addDomain('color', {})

      tree.patch({ color: 'red' })

      const branch = tree.fork()
      const leaf = branch.fork()

      expect(branch).toHaveState('color', 'red')
      expect(leaf).toHaveState('color', 'red')
    })

    it('properly archives after a patch', () => {
      const parent = new Microcosm({ maxHistory: 0 })

      parent.addDomain('one', {
        register () {
          return {
            getInitialState : () => false,
            one : (a, b) => b
          }
        }
      })

      parent.addDomain('two', {
        register () {
          return {
            getInitialState : () => false,
            two : (a, b) => b
          }
        }
      })

      parent.patch({ one: false, two: false })

      const child = parent.fork()

      const one = parent.append('one')
      const two = parent.append('two')

      two.resolve(true)
      one.resolve(true)

      expect(child.state.one).toBe(true)
      expect(child.state.two).toBe(true)
    })

    it('does not cause forks to revert state', function () {
      const parent = new Microcosm()
      const child = parent.fork()

      child.addDomain('count', {
        register () {
          return {
            'add' : (a, b) => a + b
          }
        }
      })

      child.patch({ count: 2 })

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

    it('does not strip away parent inherited state', function () {
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

      child.patch({ bottom: true })

      expect(child).toHaveState('top', false)
      expect(child).toHaveState('bottom', true)
    })

    it('does not strip away parent inherited state when the parent patches', function () {
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

      parent.patch({ top: true })

      expect(parent).toHaveState('top', true)
      expect(child).toHaveState('top', true)
    })

    it('patching on a parent does not reset state of children', function () {
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

      parent.patch({ bottom: true })

      expect(parent).not.toHaveState('bottom')
      expect(child).toHaveState('bottom', false)
    })
  })

})
