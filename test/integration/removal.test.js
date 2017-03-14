import Microcosm from '../../src/microcosm'

describe('Removal', function() {

  it('can remove an action from history', function() {
    const repo = new Microcosm({ maxHistory: Infinity })
    const handler = jest.fn()

    let action = repo.push(handler)

    expect(repo.history.size).toBe(2)

    repo.history.remove(action)

    expect(repo.history.size).toBe(1)
  })

})
