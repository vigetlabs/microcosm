import Microcosm from '../../../src/microcosm'

describe('Microcosm::checkout', function() {
  it('returns to a prior state', function() {
    const repo = new Microcosm({ maxHistory: Infinity })
    const action = n => n

    repo.addDomain('number', {
      register() {
        return {
          [action]: (a, b) => b
        }
      }
    })

    let start = repo.push(action, 1)

    repo.push(action, 2)
    repo.push(action, 3)

    repo.checkout(start)

    expect(repo).toHaveState('number', 1)
  })
})
