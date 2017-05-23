import Microcosm, { update } from '../../../src/microcosm'

describe('Microcosm::register', function() {
  it('a Microcosm can register to actiosn', function() {
    const ADD = 'ADD'

    class Repo extends Microcosm {
      getInitialState() {
        return { count: 0 }
      }

      add(state, n) {
        return update(state, 'count', value => value + n)
      }

      register() {
        return {
          [ADD]: this.add
        }
      }
    }

    let repo = new Repo()

    repo.push(ADD, 2)
    repo.push(ADD, 2)

    expect(repo).toHaveState('count', 4)
  })
})
