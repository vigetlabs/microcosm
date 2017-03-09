import History from '../../../src/history'
import Microcosm from '../../../src/microcosm'

describe('History::invoke', function() {

  it('it does invoke a repo that no longer exists', function() {
    let parent = new Microcosm()
    let child = parent.fork()

    parent.on('change', () => child.teardown())

    jest.spyOn(child, 'release')

    parent.addDomain('test', {
      getInitialState() {
        return false
      }
    })

    expect(child.release).not.toHaveBeenCalled()
  })

})
