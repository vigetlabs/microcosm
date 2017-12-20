import Microcosm from 'microcosm'

describe('Action::teardown', function() {
  it('does not lose an onDone subscription when it resolves', function(done) {
    function test(action, method, payload) {
      return function(action) {
        Promise.resolve().then(
          () => action.complete(true),
          () => action.error(false)
        )
      }
    }

    const repo = new Microcosm()

    repo.push(test).subscribe({
      complete: () => done()
    })
  })

  it('does not lose an onError subscription when it fails', function(done) {
    function test(action, method, payload) {
      return Promise.reject()
    }

    const repo = new Microcosm()

    repo.push(test).subscribe({
      error: () => done()
    })
  })

  it('does not lose an unsubscription subscription when it unsubscribes', function(done) {
    function test(action, method, payload) {
      return function(action) {
        // intentionally blank
      }
    }

    const repo = new Microcosm()
    const action = repo.push(test)

    action.subscribe({ unsubscribe: () => done() })
    action.unsubscribe()
  })
})
