import Task from '../../../src/task'
import Microcosm from '../../../src/microcosm'

const identity = n => n

describe('Task disabled state', function () {

  it('preserves other states when disabled', function () {
    let task = new Task(identity)

    task.resolve()
    task.toggle()

    expect(task).toHaveStatus('done')
  })

  it('is toggleable', function () {
    let task = new Task(identity)

    task.resolve()
    expect(task.disabled).toBe(false)

    task.toggle()
    expect(task.disabled).toBe(true)
  })

  it('can toggle without triggering an event', function () {
    let task = new Task(identity)
    let handler = jest.fn()

    task.on('change', handler)
    task.toggle('silently')

    expect(handler).not.toHaveBeenCalled()
  })

})
