import Microcosm from 'microcosm'

describe('Thunk middleware', function() {
  it('passes the action and repo as arguments', async () => {
    let spy = jest.fn(action => action.complete())
    let repo = new Microcosm()
    let action = repo.push(n => spy)

    await action

    expect(spy).toHaveBeenCalledWith(action, repo)
  })

  it('passes a next update before completing', async () => {
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
