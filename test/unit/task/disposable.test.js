import Task from '../../../src/task'
import Microcosm from '../../../src/microcosm'

const identity = n => n

describe('Task disposable state', function () {

  it('tasks are disposable when they resolve', function () {
    let task = new Task(identity)

    task.resolve(true)

    expect(task.disposable).toBe(true)
  })

  it('tasks are disposable when they cancel', function () {
    let task = new Task(identity)

    task.cancel(true)

    expect(task.disposable).toBe(true)
  })

  it('tasks are disposable when they fail', function () {
    let task = new Task(identity)

    task.reject(true)

    expect(task.disposable).toBe(true)
  })

  it('will not change states if already disposed', function () {
    let task = new Task(identity)

    task.cancel()
    task.resolve()

    expect(task.is('cancelled')).toBe(true)
    expect(task.is('done')).toBe(false)
  })

})
