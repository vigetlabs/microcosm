import History from '../../../src/history'

describe('History::append', function () {
  const action = n => n

  it('adjusts the focal point when adding a node', function () {
    const history = new History()

    history.append(action)
    history.append(action)

    expect(history.head.command).toEqual(action)
  })

  it('can get the previous node in the chain', function () {
    const history = new History()

    const one = history.append(action)
    const two = history.append(action)
    const three = history.append(action)

    expect(two.parent).toEqual(one)
    expect(three.parent).toEqual(two)
  })

  it('emits an append event with the latest action', function () {
    expect.assertions(1)

    const history = new History()
    const type = n => n

    history.on('append', function (action) {
      expect(action.command).toBe(type)
    })

    history.append(type)
  })
})
