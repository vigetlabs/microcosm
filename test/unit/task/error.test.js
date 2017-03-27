import Task from '../../../src/task'
import Microcosm from '../../../src/microcosm'

const identity = n => n

describe('Task error state', function () {

  it('exposes a error type when rejected', function () {
    let task = new Task(identity)

    task.reject()

    expect(task).toHaveStatus('error')
  })

  it('triggers a error event when it is rejected', function () {
    let task = new Task(identity)
    let callback = jest.fn()

    task.once('reject', callback)
    task.reject(404)

    expect(callback).toHaveBeenCalledWith(404)
  })

  it('listens to failures', function () {
    let task = new Task(identity)
    let fn = jest.fn()

    task.onError(fn)
    task.reject(true)

    expect(fn).toHaveBeenCalledWith(true)
  })

  it('immediately invokes onError if the task already failed', function () {
    let task = new Task(identity)
    let fn = jest.fn()

    task.reject(true)
    task.onError(fn)

    expect(fn).toHaveBeenCalledWith(true)
  })

  it('does not trigger an error event if it is disposable', function () {
    let task = new Task(identity)
    let spy = jest.fn()

    task.on('error', spy)
    task.resolve()
    task.reject()

    expect(spy).not.toHaveBeenCalled()
  })

  it('aliases the done type with reject', function () {
    let task = new Task(identity)

    task.reject()

    expect(task).toHaveStatus('error')
  })

})
