import Task from '../../../src/task'
import Microcosm from '../../../src/microcosm'

const identity = n => n

describe('Task done state', function () {

  it('exposes a done type when completed', function () {
    let task = new Task(identity)

    task.resolve()

    expect(task).toHaveStatus('done')
  })

  it('triggers a done event when it resolves', function () {
    let task = new Task(identity)
    let callback = jest.fn()

    task.once('resolve', callback)
    task.resolve(3)

    expect(callback).toHaveBeenCalledWith(3)
  })

  it('immediately invokes onDone if the task already closed', function () {
    let task = new Task(identity)
    let callback = jest.fn()

    task.resolve(true)
    task.onDone(callback)

    expect(callback).toHaveBeenCalledWith(true)
  })

  it('tasks are no longer open when they complete', function () {
    let task = new Task(identity)

    task.open(true)
    task.update(true)
    task.resolve(true)

    expect(task).not.toHaveStatus('loading')
    expect(task).toHaveStatus('done')
  })

  it('tasks can not be resolved after rejected', function () {
    let repo = new Microcosm()
    let task = repo.append(identity)

    task.reject(false)
    task.resolve(true)

    expect(task).toHaveStatus('error')
    expect(task).not.toHaveStatus('done')
  })

  it('aliases the done type with resolve', function () {
    let task = new Task(identity)

    task.resolve()

    expect(task).toHaveStatus('resolve')
  })

})
