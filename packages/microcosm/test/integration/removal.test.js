import Microcosm from 'microcosm'

describe('Removal', function() {
  it('can remove an action from history', function() {
    const repo = new Microcosm({ debug: true })
    const handler = jest.fn()

    let action = repo.push(handler)

    expect(repo.history.size).toBe(1)

    repo.history.remove(action)

    expect(repo.history.size).toBe(1)
  })
})
