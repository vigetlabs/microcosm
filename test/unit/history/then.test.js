import History from '../../../src/history'

describe('History::then', function () {
  const action = n => n

  it('allows direct interop with promises', function () {
    const history = new History()

    let one = history.append(action)
    let two = history.append(action)
    let three = history.append(action)

    setTimeout(function () {
      one.resolve()
      two.resolve()
      three.resolve()
    }, 10)

    // This will fail if the promise returned from `history.then`
    // rejects, it will only pass when the promise resolves.
    return history
  })

  it('passes a failure callback', function () {
    const history = new History()

    let one = history.append(action)
    let two = history.append(action)
    let three = history.append(action)

    setTimeout(function () {
      one.resolve()
      two.resolve()
      three.reject('Error')
    }, 10)

    return history.then(null, function (error) {
      expect(error).toEqual('Error')
    })
  })
})
