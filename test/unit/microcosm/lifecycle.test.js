import Microcosm from '../../../src/microcosm'

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
