import Microcosm from '../../../src/microcosm'

describe('Microcosm::push', function () {
  it('the pushed function has no scope', function (done) {
    let repo = new Microcosm()

    repo.push(function () {
      expect(this).toBe(null)
      done()
    })
  })

  it('can push an action, resolving it into state', function () {
    let repo = new Microcosm()
    let step = n => n

    repo.addDomain('count', {
      getInitialState () {
        return 0
      },
      register () {
        return {
          [step]: (count, n) => count + n,
        }
      },
    })

    repo.push(step, 1)
    repo.push(step, 3)

    expect(repo).toHaveState('count', 4)
  })

  it('does not change if no action responds', () => {
    const repo = new Microcosm()
    const spy = jest.fn()

    repo.addDomain('test', {})
    repo.on('change', spy)

    repo.push('whatever')

    expect(spy).toHaveBeenCalledTimes(0)
  })

  describe('forks', function () {
    it('pushing actions on the child float up to the parent', function () {
      const parent = new Microcosm()
      const child = parent.fork()

      const setColor = n => n
      const setShape = n => n

      parent.addDomain('color', {
        getInitialState () {
          return 'red'
        },
        register () {
          return { [setColor]: (a, b) => b }
        },
      })

      child.addDomain('shape', {
        getInitialState () {
          return 'triangle'
        },
        register () {
          return { [setShape]: (a, b) => b }
        },
      })

      expect(parent.state.color).toEqual('red')
      expect(parent.state.shape).toEqual(undefined)
      expect(child.state.color).toEqual('red')

      expect(child.state.shape).toEqual('triangle')

      child.push(setShape, 'square')
      child.push(setColor, 'blue')

      expect(parent.state.color).toEqual('blue')
      expect(parent.state.shape).toEqual(undefined)
      expect(child.state.color).toEqual('blue')
      expect(child.state.shape).toEqual('square')
    })

    it('pushing actions on the parent sink down to children', function () {
      const parent = new Microcosm()
      const child = parent.fork()

      const setColor = n => n
      const setShape = n => n

      parent.addDomain('color', {
        getInitialState () {
          return 'red'
        },
        register () {
          return { [setColor]: (a, b) => b }
        },
      })

      child.addDomain('shape', {
        getInitialState () {
          return 'triangle'
        },
        register () {
          return { [setShape]: (a, b) => b }
        },
      })

      expect(parent.state.color).toEqual('red')
      expect(parent.state.shape).toEqual(undefined)
      expect(child.state.color).toEqual('red')
      expect(child.state.shape).toEqual('triangle')

      parent.push(setShape, 'square')
      parent.push(setColor, 'blue')

      expect(parent.state.color).toEqual('blue')
      expect(parent.state.shape).toEqual(undefined)
      expect(child.state.color).toEqual('blue')
      expect(child.state.shape).toEqual('square')
    })

    it('forks from the same parent propagate', function () {
      const parent = new Microcosm()
      const left = parent.fork()
      const right = parent.fork()

      const setColor = n => n

      parent.addDomain('color', {
        getInitialState () {
          return 'red'
        },
        register () {
          return { [setColor]: (a, b) => b }
        },
      })

      parent.push(setColor, 'blue')

      expect(parent.state.color).toEqual('blue')
      expect(right.state.color).toEqual('blue')
      expect(left.state.color).toEqual('blue')
    })
  })
})
