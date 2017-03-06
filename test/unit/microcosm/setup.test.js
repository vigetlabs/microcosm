import Microcosm from '../../../src/microcosm'

describe('Microcosm::setup', function() {

  it('passes options from instantiation', function () {
    const test = jest.fn()

    class Repo extends Microcosm {
      get setup () {
        return test
      }
    }

    expect(new Repo({ foo: 'bar' }).setup).toHaveBeenCalledWith({ foo: 'bar' })
  })

})
