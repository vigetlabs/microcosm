import Microcosm from '../../../src/microcosm'

describe('Microcosm::addDomain', function () {

  it('adding a domain backfills the initial state', function () {
    let repo = new Microcosm()

    repo.addDomain('a', {
      getInitialState () {
        return 0
      }
    })

    expect(repo).toHaveState('a', 0)

    repo.addDomain('b', {
      getInitialState () {
        return 1
      }
    })

    expect(repo).toHaveState('a', 0)
    expect(repo).toHaveState('b', 1)
  })

})
