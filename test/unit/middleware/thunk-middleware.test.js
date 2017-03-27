import Microcosm from '../../../src/microcosm'

describe('Thunk middleware', function () {

  it('passes the task and repo as arguments', function () {
    let spy = jest.fn()
    let repo = new Microcosm()
    let task = repo.push(n => spy)

    expect(spy).toHaveBeenCalledWith(task, repo)
  })

})
