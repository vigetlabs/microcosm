import Microcosm from 'microcosm'

describe('History::sharedRoot', function() {
  const action = n => n
  const history = new Microcosm().history

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

  it('returns the shared root for inactive actions', function() {
    expect(history.sharedRoot(three)).toEqual(two)
    expect(history.sharedRoot(four)).toEqual(two)
  })

  it('returns the provided action if the action is active', function() {
    expect(history.sharedRoot(one)).toEqual(one)
    expect(history.sharedRoot(two)).toEqual(two)
    expect(history.sharedRoot(five)).toEqual(five)
    expect(history.sharedRoot(six)).toEqual(six)
  })
})
