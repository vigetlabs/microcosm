import Task from '../../../src/task'
import Microcosm from '../../../src/microcosm'

const identity = n => n

describe('Task cancelled state', function () {

  it('triggers a cancel event when it is cancelled', function () {
    let task = new Task(identity)
    let callback = jest.fn()

    task.once('cancel', callback)
    task.cancel()

    expect(callback).toHaveBeenCalled()
  })

  it('becomes disposable when cancelled', function () {
    let task = new Task(identity)

    task.cancel()

    expect(task.disposable).toBe(true)
  })

  it('exposes a cancelled type when cancelled', function () {
    let task = new Task(identity)

    task.cancel()

    expect(task).toHaveStatus('cancel')
  })

  it('onCancel is a one time binding', function () {
    let task = new Task(identity)
    let callback = jest.fn()

    task.onCancel(callback)

    task.cancel()
    task.cancel()

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('executes onCancel if the task is already cancelled', function () {
    let task = new Task(identity)
    let callback = jest.fn()

    task.cancel()
    task.onCancel(callback)

    expect(callback).toHaveBeenCalled()
  })

  it('aliases the cancelled type with cancel', function () {
    let task = new Task(identity)

    task.cancel()

    expect(task).toHaveStatus('cancel')
  })

})
