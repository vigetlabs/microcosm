import Microcosm from 'microcosm'

describe('History::then', function() {
  const action = n => n

  it('allows direct interop with promises', function() {
    const repo = new Microcosm()

    let one = repo.append(action)
    let two = repo.append(action)
    let three = repo.append(action)

    setTimeout(function() {
      one.resolve()
      two.resolve()
      three.resolve()
    }, 10)

    // This will fail if the promise returned from `history.then`
    // rejects, it will only pass when the promise resolves.
    return repo.history
  })

  it('passes a failure callback', function() {
    const repo = new Microcosm()

    let one = repo.append(action)
    let two = repo.append(action)
    let three = repo.append(action)

    setTimeout(function() {
      one.resolve()
      two.resolve()
      three.reject('Error')
    }, 10)

    return repo.history.then(null, function(error) {
      expect(error).toEqual('Error')
    })
  })
})
