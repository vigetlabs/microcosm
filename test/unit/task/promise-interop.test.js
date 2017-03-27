import Task from '../../../src/task'
import Microcosm from '../../../src/microcosm'

const identity = n => n

describe('Task promise interop', function () {

  it('tasks interop with promises', function () {
    let task = new Task(identity)

    task.resolve('Test')

    return task.then(result => expect(result).toBe('Test'))
  })

  it('task interop with async/await', async function () {
    let task = new Task(identity)

    task.resolve('Test')

    let payload = await task

    expect(payload).toBe('Test')
  })

})
