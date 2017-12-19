import Microcosm from 'microcosm'

describe.skip('Microcosm::dispatch', function() {
  it('does not mutate base state on prior dispatches', function() {
    const repo = new Microcosm()
    const mutation = () => true

    repo.addDomain('ui', {
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
    expect(repo.history.size).toEqual(1)
    expect(repo).toHaveState('ui.toggled', true)

    repo.push(mutation)
    expect(repo.history.size).toEqual(1)
    expect(repo).toHaveState('ui.toggled', false)

    repo.push(mutation)
    expect(repo.history.size).toEqual(1)
    expect(repo).toHaveState('ui.toggled', true)
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

    repo.addEffect({
      register() {
        return {
          test: repo => {
            // Assert that domains receive the result of
            // earlier domain processing
            expect(repo).toHaveState('color', 'purple')
          }
        }
      }
    })

    repo.push('test', 'purple')

    expect(repo).toHaveState('color', 'purple')
  })
})
