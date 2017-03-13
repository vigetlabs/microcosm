import Action from '../../../src/action'

describe('abandon', function () {

  it('will not abandon the same child twice', function () {
    const one = new Action(n => n)
    const two = new Action(n => n)
    const parent = new Action(n => n)

    parent.adopt(one)
    parent.adopt(two)

    parent.abandon(one)
    parent.abandon(one)

    expect(parent.children).toEqual([two])
  })

})
