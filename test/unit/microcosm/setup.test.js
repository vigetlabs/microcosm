import Microcosm from '../../../src/microcosm'

describe('Microcosm::setup', function () {
  it('extends defaults with options passed from instantiation', function () {
    expect.assertions(2)

    class Repo extends Microcosm {
      setup (options) {
        expect(options.foo).toEqual('bar')
        expect(options.maxHistory).toEqual(0)
      }
    }

    new Repo({ foo: 'bar' })
  })

  it('receives an options object, even when it is not passed', function () {
    expect.assertions(1)

    class Repo extends Microcosm {
      setup (options) {
        expect(options).toBeDefined()
      }
    }

    new Repo()
  })
})
