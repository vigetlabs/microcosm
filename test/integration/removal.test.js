import Microcosm from '../../src/microcosm'

describe('Removal', function() {

  it('can remove an task from history', function() {
    const repo = new Microcosm({ maxHistory: Infinity })
    const handler = jest.fn()

    let task = repo.push(handler)

    expect(repo.history.size).toBe(2)

    repo.history.remove(task)

    expect(repo.history.size).toBe(1)
  })

})
