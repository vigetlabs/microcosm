import History from '../../../src/history'
import Microcosm from '../../../src/microcosm'

describe('History::removeRepo', function() {

  it('Does not remove a repo outside of the tracked repo', function() {
    const history = new History()
    const repo = new Microcosm()

    history.addRepo(repo)
    history.removeRepo(new Microcosm())

    expect(history.repos).toEqual([repo])
  })

})
