import Task from '../../../src/task'

describe('abandon', function () {

  it('will not abandon the same child twice', function () {
    const one = new Task(n => n)
    const two = new Task(n => n)
    const parent = new Task(n => n)

    parent.adopt(one)
    parent.adopt(two)

    parent.abandon(one)
    parent.abandon(one)

    expect(parent.children).toEqual([two])
  })

})
