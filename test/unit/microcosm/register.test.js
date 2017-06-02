import Microcosm, { update } from '../../../src/microcosm'

describe('Microcosm::register', function() {
  it('a Microcosm can register to actions', function() {
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

  describe('lifecycle hooks', function() {
    it('does not call deserialize infinitely', function() {
      class Repo extends Microcosm {
        register() {
          return {}
        }
      }

      let repo = new Repo()
      let spy = jest.spyOn(repo, 'deserialize')

      repo.deserialize()

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('does not call serialize infinitely', function() {
      class Repo extends Microcosm {
        register() {
          return {}
        }
      }

      let repo = new Repo()
      let spy = jest.spyOn(repo, 'serialize')

      repo.serialize()

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('does not call getInitialState infinitely', function() {
      class Repo extends Microcosm {
        register() {
          return {}
        }
      }

      let repo = new Repo()
      let spy = jest.spyOn(repo, 'getInitialState')

      repo.getInitialState()

      expect(spy).toHaveBeenCalledTimes(1)
    })
  })
})
