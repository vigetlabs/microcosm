import Microcosm from '../src/microcosm'

it('does not mutate base state on prior dispatches', function () {
  const repo = new Microcosm()
  const mutation = () => true

  repo.addDomain(null, {
    getInitialState() {
      return {
        toggled: false
      }
    },

    register() {
      return {
        [mutation](state) {
          state.toggled = !state.toggled
          return state
        }
      }
    }
  })

  repo.push(mutation)
  expect(repo.history.size).toEqual(0)
  expect(repo).toHaveState('toggled', true)

  repo.push(mutation)
  expect(repo.history.size).toEqual(0)
  expect(repo).toHaveState('toggled', false)

  repo.push(mutation)
  expect(repo.history.size).toEqual(0)
  expect(repo).toHaveState('toggled', true)
})
