import History from '../../../src/history'

describe('History::map', function() {
  it('provides the index', function() {
    const history = new History({ maxHistory: Infinity })

    history.append('one', 'resolve')
    history.append('two', 'resolve')
    history.append('three', 'resolve')

    let result = history.map((action, i) => i)

    expect(result).toEqual([0, 1, 2])
  })
})
