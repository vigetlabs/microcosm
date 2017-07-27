import Microcosm from '../../src/microcosm'

describe('Re-executing domain handlers', function() {
  it('does not call the same domain handler twice if it would result in no change', function() {
    let repo = new Microcosm()

    let addOne = jest.fn((count, n) => count + n)
    let addTwo = jest.fn((count, n) => count + n)

    repo.addDomain('counterOne', {
      getInitialState() {
        return 0
      },
      register() {
        return { addOne }
      }
    })

    repo.addDomain('counterTwo', {
      getInitialState() {
        return 0
      },
      register() {
        return { addTwo }
      }
    })

    let one = repo.append('addOne')

    repo.push('addTwo', 2)

    one.resolve(1)

    expect(addOne).toHaveBeenCalledTimes(1)

    expect(addTwo).toHaveBeenCalledTimes(1)

    expect(repo.state).toEqual({ counterOne: 1, counterTwo: 2 })
  })

  it('does not call the same domain handler twice when two domains listen to the same action from a different key', function() {
    let repo = new Microcosm()

    let addOne = jest.fn((count, n) => count + n)
    let addTwo = jest.fn((count, n) => count + n)

    repo.addDomain('counterOne', {
      getInitialState() {
        return 0
      },
      addCounterOne() {
        return addOne(...arguments)
      },
      register() {
        return { test: this.addCounterOne }
      }
    })

    repo.addDomain('counterTwo', {
      getInitialState() {
        return 0
      },
      addCounterTwo: function() {
        return addTwo(...arguments)
      },
      register() {
        return { test: this.addCounterTwo }
      }
    })

    let one = repo.append('test')

    repo.push('test', 2)

    one.resolve(1)

    expect(repo.state).toEqual({ counterOne: 3, counterTwo: 3 })

    expect(addOne).toHaveBeenCalledTimes(3)
    expect(addTwo).toHaveBeenCalledTimes(3)
  })

  it('does not call the same domain handler again for the same update state', function() {
    let repo = new Microcosm()

    let addOne = jest.fn((count, n) => count + n)
    let addTwo = jest.fn((count, n) => count + n)

    repo.addDomain('counterOne', {
      getInitialState() {
        return 0
      },
      register() {
        return {
          addOne: {
            update: addOne
          }
        }
      }
    })

    repo.addDomain('counterTwo', {
      getInitialState() {
        return 0
      },
      register() {
        return { addTwo }
      }
    })

    let one = repo.append('addOne')

    repo.push('addTwo', 2)

    one.update(1)
    one.update(2)
    one.update(3)

    expect(addOne).toHaveBeenCalledTimes(3) // once for each update

    expect(addTwo).toHaveBeenCalledTimes(1) // once for resolve

    expect(repo.state).toEqual({ counterOne: 3, counterTwo: 2 })
  })

  it('does not call the same domain handler when a fork listens to the same action from a different key', function() {
    let parent = new Microcosm()

    let addOne = jest.fn((count, n) => count + n)
    let addTwo = jest.fn((count, n) => count + n)

    parent.addDomain('counterOne', {
      getInitialState() {
        return 0
      },
      addCounterOne() {
        return addOne(...arguments)
      },
      register() {
        return { test: this.addCounterOne }
      }
    })

    let child = parent.fork()

    child.addDomain('counterTwo', {
      getInitialState() {
        return 0
      },
      addCounterTwo: function() {
        return addTwo(...arguments)
      },
      register() {
        return { test: this.addCounterTwo }
      }
    })

    let one = parent.append('test')

    parent.push('test', 2)

    one.resolve(1)

    expect(parent).toHaveState('counterOne', 3)
    expect(parent).not.toHaveState('counterTwo')

    expect(child).toHaveState('counterOne', 3)
    expect(child).toHaveState('counterTwo', 3)

    expect(addOne).toHaveBeenCalledTimes(3)
    expect(addTwo).toHaveBeenCalledTimes(3)
  })
})
