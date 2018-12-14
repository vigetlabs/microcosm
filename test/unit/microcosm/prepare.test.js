import Microcosm from 'microcosm'

describe('Microcosm::prepare', function() {
  it('partially applies Microcosm::push', function() {
    const repo = new Microcosm()
    const action = jest.fn()

    repo.prepare(action, 1, 2)(3)

    expect(action).toBeCalledWith(1, 2, 3)
  })
})
