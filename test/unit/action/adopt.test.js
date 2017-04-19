import Action from '../../../src/action'

describe('adopt', function () {
  it('will not adopt the same child twice', function () {
    const child = new Action(n => n)
    const parent = new Action(n => n)

    parent.adopt(child)
    parent.adopt(child)

    expect(parent.children).toEqual([child])
  })
})
