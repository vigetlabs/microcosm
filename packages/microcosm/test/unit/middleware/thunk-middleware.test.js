import Microcosm from 'microcosm'

describe('Thunk middleware', function() {
  it('passes the action and repo as arguments', function() {
    let spy = jest.fn()
    let repo = new Microcosm()
    let action = repo.push(n => spy)

    expect(spy).toHaveBeenCalledWith(action, repo)
  })

  it('does not treat function action arguments as thunks when they are directly returned', function() {
    expect.assertions(2)

    let action = fn => fn
    let spy = jest.fn()
    let repo = new Microcosm()

    repo.push(action, spy).onDone(result => {
      expect(result).toEqual(spy)
      expect(spy).not.toHaveBeenCalled()
    })
  })
})
