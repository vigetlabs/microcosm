import Microcosm from 'microcosm'

describe('History::isActive', function() {
  const action = n => n
  const repo = new Microcosm({ debug: true })
  const history = repo.history

  /*
   * Set up the following tree:
   *
   *               |- [three] - [four]
   * [one] - [two] +
   *               |- [five] - [*six]
   */

  const one = repo.push('one')
  const two = repo.push('two')
  const three = repo.push('three')
  const four = repo.push('four')

  history.checkout(two)

  const five = repo.push('five')
  const six = repo.push('six')

  history.checkout(four)

  it('returns true for actions in the active branch', function() {
    expect(history.isActive(one)).toEqual(true)
    expect(history.isActive(two)).toEqual(true)
    expect(history.isActive(three)).toEqual(true)
    expect(history.isActive(four)).toEqual(true)
  })

  it('returns false for actions not in the active branch', function() {
    expect(history.isActive(five)).toEqual(false)
    expect(history.isActive(six)).toEqual(false)
  })
})
