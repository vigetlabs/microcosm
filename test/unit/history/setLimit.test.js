import History from '../../../src/history'

describe('History::setLimit', function() {
  const action = n => n

  it('sets the correct size given Infinity', function() {
    const history = new History()
    history.setLimit(Infinity)

    expect(history.limit).toEqual(Infinity)
  })

  it('sets the correct size given an integer', function() {
    const history = new History()
    history.setLimit(10)

    expect(history.limit).toEqual(10)
  })

  it('sets the limit to 0 given a negative integer', function() {
    const history = new History()
    history.setLimit(-10)

    expect(history.limit).toEqual(0)
  })
})
