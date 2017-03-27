import Task from '../../../src/task'
import Microcosm from '../../../src/microcosm'

const identity = n => n

describe('Task update state', function () {

  it('exposes a loading type when in progress', function () {
    let task = new Task(identity)

    task.update()

    expect(task).toHaveStatus('update')
  })

  it('listens to progress updates', function () {
    let task = new Task(identity)
    let fn = jest.fn()

    task.onUpdate(fn)
    task.update(true)

    expect(fn).toHaveBeenCalledWith(true)
  })

  it('does not trigger onUpdate if in progress', function () {
    let task = new Task(identity)
    let fn = jest.fn()

    task.update(true)
    task.onUpdate(fn)

    expect(fn).not.toHaveBeenCalled()
  })

  it('tasks are no longer open when in progress', function () {
    let task = new Task(identity)

    task.open(true)
    task.update(true)

    expect(task).not.toHaveStatus('open')
    expect(task).toHaveStatus('loading')
  })

  it('triggers an update event when it updates', function () {
    let task = new Task(identity)
    let callback = jest.fn()

    task.once('update', callback)
    task.update(3)

    expect(callback).toHaveBeenCalledWith(3)
  })

  it('does not trigger an update event if it is disposable', function () {
    let task = new Task(identity)
    let spy = jest.fn()

    task.on('update', spy)
    task.resolve()
    task.update()

    expect(spy).not.toHaveBeenCalled()
  })

  it('aliases the loading type with update', function () {
    let task = new Task(identity)

    task.update()

    expect(task).toHaveStatus('update')
  })

  it('updates repo state with the latest progress', function () {
    let repo = new Microcosm()
    let test = n => n
    let handler = jest.fn(n => n)

    repo.addDomain('progress', {
      getInitalState() {
        return 0
      },
      register () {
        return {
          [test]: {
            update: (a, b) => handler(b)
          }
        }
      }
    })

    let task = repo.append(test)

    task.update(1)
    expect(handler).toHaveBeenCalledWith(1)
    expect(repo).toHaveState('progress', 1)

    task.update(2)
    expect(handler).toHaveBeenCalledWith(2)
    expect(repo).toHaveState('progress', 2)

    task.update(3)
    expect(handler).toHaveBeenCalledWith(3)
    expect(repo).toHaveState('progress', 3)
  })

})
