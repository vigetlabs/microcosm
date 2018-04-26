import Microcosm from 'microcosm'

describe('History updater', function() {
  it('only sends out the bare minimum change events', async function() {
    const repo = new Microcosm()

    let spy = jest.fn()

    repo.addDomain('test', {})

    repo.history.subscribe(spy)

    await repo.push('one', 1)
    await repo.push('two', 2)

    expect(spy).toHaveBeenCalledTimes(2)
  })
})
