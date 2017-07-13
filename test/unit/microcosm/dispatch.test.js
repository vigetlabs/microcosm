import Microcosm from '../../../src/microcosm'

describe('Microcosm::dispatch', function() {
  it('does not mutate base state on prior dispatches', function() {
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

  it('does not retroactively apply old state to subsequent domain handlers', function() {
    expect.assertions(2)

    var repo = new Microcosm()

    repo.addDomain('color', {
      getInitialState() {
        return 'blue'
      },
      register() {
        return {
          test: (state, color) => color
        }
      }
    })

    repo.addDomain(null, {
      register() {
        return {
          test: state => {
            // Assert that domains receive the result of
            // earlier domain processing
            expect(state.color).toEqual('purple')

            return state
          }
        }
      }
    })

    repo.push('test', 'purple')

    expect(repo).toHaveState('color', 'purple')
  })
})
