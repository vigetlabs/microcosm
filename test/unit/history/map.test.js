import Microcosm from '../../../src/microcosm'

describe('History::map', function() {
  it('provides the index', function() {
    const repo = new Microcosm({ maxHistory: Infinity })

    repo.push('one')
    repo.push('two')
    repo.push('three')

    let result = repo.history.map((action, i) => i)

    expect(result).toEqual([0, 1, 2])
  })
})
