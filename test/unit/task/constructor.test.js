import Task from '../../../src/task'
import Microcosm from '../../../src/microcosm'

const identity = n => n

describe('Task constructor', function () {

  it('a task payload is undefined by default', function () {
    let task = new Task('test').resolve()

    expect(task.payload).toBe(undefined)
  })

  it('a task can be set to a specific status', function () {
    let repo = new Microcosm()
    let task = repo.append('test', 'resolve')

    expect(task.is('resolve')).toBe(true)
  })

})
