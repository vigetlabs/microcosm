/**
 * This test covers a bug where the state gets out of sync when an
 * action is pushed within another action. We first encountered this
 * on a project where we wanted to remove a "focused" state when
 * saving data using another action.
 */

import Microcosm, { update, patch } from 'microcosm'

describe('When pushing actions inside of another action', function() {
  it('does not return to an old state when pushing the second action', function() {
    expect.assertions(8)

    let repo = new Microcosm()

    function focuser(focus) {
      return focus
    }

    function stepper() {
      return function(action, repo) {
        expect(repo).toHaveState('data.count', 2)
        expect(repo).toHaveState('data.focus', true)

        repo.push(focuser, false)

        expect(repo).toHaveState('data.count', 2)
        expect(repo).toHaveState('data.focus', false)

        action.next(2)
        expect(repo).toHaveState('data.count', 2)
        expect(repo).toHaveState('data.focus', false)

        action.next(1)
        action.complete()
        expect(repo).toHaveState('data.count', 3)
        expect(repo).toHaveState('data.focus', false)
      }
    }

    repo.addDomain('data', {
      getInitialState() {
        return { count: 0, focus: false }
      },
      increase(state, amount) {
        return update(state, 'count', n => n + amount)
      },
      setFocus(state, yes) {
        return update(state, 'focus', yes)
      },
      register() {
        return {
          [stepper]: this.increase,
          [focuser]: this.setFocus
        }
      }
    })

    repo.push(patch, { data: { count: 2, focus: true } })
    repo.push(stepper)
  })
})
