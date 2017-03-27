import Microcosm from '../../../src/microcosm'

describe('Microcosm::prepare', function () {

  it('partially applies Microcosm::push', function () {
    let repo = new Microcosm()
    let task = jest.fn()

    repo.prepare(task, 1, 2)(3)

    expect(task).toBeCalledWith(1,2,3)
  })

})
