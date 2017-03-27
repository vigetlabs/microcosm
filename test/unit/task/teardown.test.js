import Task from '../../../src/task'
import Microcosm from '../../../src/microcosm'

const identity = n => n

describe('Task::teardown', function () {

  it('does not lose an onDone subscription when it resolves', function (done) {
    function test () {
      return function (task) {
        Promise.resolve().then(() => task.resolve(true),
                               () => task.reject(false))
      }
    }

    let repo = new Microcosm()
    let task = repo.push(test)

    task.onDone(() => done())
  })

  it('does not lose an onError subscription when it fails', function (done) {
    function test () {
      return Promise.reject()
    }

    let repo = new Microcosm()
    let task = repo.push(test)

    task.onError(() => done())
  })

  it('does not lose an onCancel subscription when it cancels', function (done) {
    function test () {
      return function (task) {
        // intentionally blank
      }
    }

    let repo = new Microcosm()

    let task = repo.push(test)

    task.onCancel(() => done())

    task.cancel()
  })
})
