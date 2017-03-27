import Task from '../../../src/task'
import Microcosm from '../../../src/microcosm'

const identity = n => n

describe('Task open state', function () {

  it('exposes an open type when opened', function () {
    let task = new Task(identity)

    task.open()

    expect(task).toHaveStatus('open')
  })

  it('triggers an open event when it opens', function () {
    let task = new Task(identity)
    let callback = jest.fn()

    task.once('open', callback)
    task.open(3)

    expect(callback).toHaveBeenCalledWith(3)
  })

  it('tasks are no longer disabled when opened', function () {
    let task = new Task(identity)

    task.open(true)

    expect(task.disabled).toBe(false)
    expect(task).toHaveStatus('open')
  })

  it('does not trigger an open event if it is disposable', function () {
    let task = new Task(identity)
    let spy = jest.fn()

    task.on('open', spy)
    task.resolve()
    task.open()

    expect(spy).not.toHaveBeenCalled()
  })

})
