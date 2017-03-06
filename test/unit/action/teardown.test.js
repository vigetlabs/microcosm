import Action from '../../../src/action'
import Microcosm from '../../../src/microcosm'

const identity = n => n

describe('Action::teardown', function () {

  it('does not lose an onDone subscription when it resolves', function (done) {
    function test (action, method, payload) {
      return function (action) {
        Promise.resolve().then(() => action.resolve(true),
                               () => action.reject(false))
      }
    }

    const repo = new Microcosm()

    const action = repo.push(test)

    action.onDone(() => done())
  })

  it('does not lose an onError subscription when it fails', function (done) {
    function test (action, method, payload) {
      return Promise.reject()
    }

    const repo = new Microcosm()

    const action = repo.push(test)

    action.onError(() => done())
  })

  it('does not lose an onCancel subscription when it cancels', function (done) {
    function test (action, method, payload) {
      return function (action) {
        // intentionally blank
      }
    }

    const repo = new Microcosm()

    const action = repo.push(test)

    action.onCancel(() => done())

    action.cancel()
  })
})
