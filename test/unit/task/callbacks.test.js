import Task from '../../../src/task'
import Microcosm from '../../../src/microcosm'

describe('Task callbacks', function () {

  it('handles listeners with no callback', function () {
    let task = new Task(n => n)

    task.onDone()
    task.onError()
    task.onCancel()
    task.onUpdate()
  })

})
