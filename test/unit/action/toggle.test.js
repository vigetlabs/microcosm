import Action from '../../../src/action'
import Microcosm from '../../../src/microcosm'

describe('Action::toggle', function() {

  it('it will not dispatch an action disabled at the head', function () {
    const repo = new Microcosm({ maxHistory: Infinity })

    repo.addDomain('count', {
      getInitialState () {
        return 0
      },
      register () {
        return {
          action : (a, b) => a + b
        }
      }
    })

    repo.push('action', 2)
    repo.push('action', 1).toggle()

    expect(repo).toHaveState('count', 2)
  })

  it('it will not dispatch an action disabled in the middle', function () {
    const repo = new Microcosm({ maxHistory: Infinity })

    repo.addDomain('count', {
      getInitialState () {
        return 0
      },
      register () {
        return {
          action : (a, b) => a + b
        }
      }
    })

    repo.push('action', 2)
    let second = repo.push('action', 1)
    repo.push('action', 2)

    second.toggle()

    expect(repo).toHaveState('count', 4)
  })

})
