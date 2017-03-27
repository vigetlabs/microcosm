import Task from '../../../src/task'

describe('adopt', function () {

  it('will not adopt the same child twice', function () {
    let child = new Task(n => n)
    let parent = new Task(n => n)

    parent.adopt(child)
    parent.adopt(child)

    expect(parent.children).toEqual([child])
  })

})
