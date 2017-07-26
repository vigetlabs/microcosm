/**
 * This test covers a bug where the state gets out of sync when an
 * action is pushed within another action. We first encountered this
 * on a project where we wanted to remove a "focused" state when saving
 * data using another action.
 */

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

    addOne.displayName = 'addOne'
    addTwo.displayName = 'addTwo'

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

    expect(addOne).toHaveBeenCalledTimes(3)
    expect(addTwo).toHaveBeenCalledTimes(3)

    expect(repo.state).toEqual({ counterOne: 3, counterTwo: 3 })
  })
})
