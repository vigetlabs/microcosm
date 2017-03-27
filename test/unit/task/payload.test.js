import Task from '../../../src/task'
import Microcosm from '../../../src/microcosm'

describe('task.payload', function () {

  it('a task\'s payload can intentionally be set to undefined', function () {
    let task = new Task('test')

    task.open(true)
    task.resolve(undefined)

    expect(task.payload).toBe(undefined)
  })

})
