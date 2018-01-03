import Microcosm from 'microcosm'

describe('Thunk middleware', function() {
  it('passes the action and repo as arguments', function() {
    let spy = jest.fn()
    let repo = new Microcosm()
    let action = repo.push(n => spy)

    expect(spy).toHaveBeenCalledWith(action, repo)
  })

  // TODO: Is this an issue? next does not get called for prior "next"
  // statuses
  it.skip('passes a next update before completing', async () => {
    let repo = new Microcosm()
    let next = jest.fn()

    let action = repo.push(() => action => {
      action.next(true)
      setTimeout(action.complete, 0)
    })

    action.subscribe({ next })

    await action

    expect(next).toHaveBeenCalledWith(true)
  })

  it('does not treat function action arguments as thunks when they are directly returned', async function() {
    let action = fn => fn
    let spy = jest.fn()
    let repo = new Microcosm()

    let result = await repo.push(action, spy)

    expect(result).toEqual(spy)
    expect(spy).not.toHaveBeenCalled()
  })
})
