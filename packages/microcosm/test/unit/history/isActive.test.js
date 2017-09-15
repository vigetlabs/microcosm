import Microcosm from 'microcosm'

describe('History::isActive', function() {
  const action = n => n
  const repo = new Microcosm()
  const history = repo.history

  /*
   * Set up the following tree:
   *
   *               |- [three] - [four]
   * [one] - [two] +
   *               |- [five] - [*six]
   */

  const one = history.append(action)
  const two = history.append(action)
  const three = history.append(action)
  const four = history.append(action)

  history.checkout(two)

  const five = history.append(action)
  const six = history.append(action)

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
