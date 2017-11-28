import Microcosm from 'microcosm'

describe('Microcosm::push', function() {
  it('a pushed function has no scope', () => {
    expect.assertions(1)

    let repo = new Microcosm()

    return repo.push(function() {
      expect(this).toBe(null)
    })
  })

  it('a subscribed action does not dispatch twice', async () => {
    let repo = new Microcosm()
    let command = jest.fn(function() {
      return new Promise(resolve => setTimeout(resolve, 10))
    })
    let action = repo.push(command)

    action.subscribe(n => n)

    await action

    expect(command).toHaveBeenCalledTimes(1)
  })

  it('can push an action, resolving it into state', async () => {
    let repo = new Microcosm()
    let step = jest.fn(n => n)

    repo.addDomain('count', {
      getInitialState() {
        return 0
      },
      register() {
        return {
          [step]: (count, n) => count + n
        }
      }
    })

    await repo.push(step, 1)
    await repo.push(step, 3)

    await repo.history

    expect(step).toHaveBeenCalledTimes(2)
    expect(repo).toHaveState('count', 4)
  })

  it('does not change if no action responds', () => {
    const repo = new Microcosm()
    const spy = jest.fn()

    repo.addDomain('test', {})

    repo.observable.subscribe(spy)

    repo.push('whatever')

    expect(spy).toHaveBeenCalledTimes(0)
  })

  describe('forks', function() {
    it('pushing actions on the child float up to the parent', function() {
      const parent = new Microcosm()
      const child = parent.fork()

      const setColor = n => n
      const setShape = n => n

      parent.addDomain('color', {
        getInitialState() {
          return 'red'
        },
        register() {
          return { [setColor]: (a, b) => b }
        }
      })

      child.addDomain('shape', {
        getInitialState() {
          return 'triangle'
        },
        register() {
          return { [setShape]: (a, b) => b }
        }
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

    it('pushing actions on the parent sink down to children', function() {
      const parent = new Microcosm()
      const child = parent.fork()

      const setColor = n => n
      const setShape = n => n

      parent.addDomain('color', {
        getInitialState() {
          return 'red'
        },
        register() {
          return { [setColor]: (a, b) => b }
        }
      })

      child.addDomain('shape', {
        getInitialState() {
          return 'triangle'
        },
        register() {
          return { [setShape]: (a, b) => b }
        }
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

    it('forks from the same parent propagate', function() {
      const parent = new Microcosm()
      const left = parent.fork()
      const right = parent.fork()

      const setColor = n => n

      parent.addDomain('color', {
        getInitialState() {
          return 'red'
        },
        register() {
          return { [setColor]: (a, b) => b }
        }
      })

      parent.push(setColor, 'blue')

      expect(parent.state.color).toEqual('blue')
      expect(right.state.color).toEqual('blue')
      expect(left.state.color).toEqual('blue')
    })
  })
})
