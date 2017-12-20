import Microcosm from 'microcosm'

describe('subject.payload', function() {
  it('an action can intentionally be set to undefined', async () => {
    const repo = new Microcosm()
    const action = repo.push(() => action => {
      action.next(true)
      action.complete(undefined)
    })

    await action

    expect(action.payload).toBe(undefined)
  })
})
