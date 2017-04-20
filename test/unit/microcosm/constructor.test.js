import Microcosm from '../../../src/microcosm'

describe('Microcosm constructor', function () {
  it('can seed initial state', function () {
    class Repo extends Microcosm {
      setup () {
        this.addDomain('foo', {})
      }
    }

    const repo = new Repo({}, { foo: 'bar' })

    expect(repo).toHaveState('foo', 'bar')
  })

  it('can deserialize the seed', function () {
    class Repo extends Microcosm {
      setup () {
        this.addDomain('foo', {})
      }
    }

    let raw = JSON.stringify({ foo: 'bar' })

    let repo = new Repo({}, raw, true)

    expect(repo).toHaveState('foo', 'bar')
  })

  describe('options', function () {
    describe('parent', function () {
      it('has no parent by default', function () {
        expect.assertions(1)

        class Repo extends Microcosm {
          setup ({ parent }) {
            expect(parent).toEqual(null)
          }
        }

        new Repo()
      })
    })

    describe('maxHistory', function () {
      it('has no history by default', function () {
        expect.assertions(1)

        class Repo extends Microcosm {
          setup ({ maxHistory }) {
            expect(maxHistory).toEqual(0)
          }
        }

        new Repo()
      })

      it('controls how many transactions are merged', function () {
        const repo = new Microcosm({ maxHistory: 5 })
        const identity = n => n

        repo.push(identity, 1)
        repo.push(identity, 2)
        repo.push(identity, 3)
        repo.push(identity, 4)
        repo.push(identity, 5)

        expect(repo.history.size).toEqual(5)

        repo.push(identity, 6)

        expect(repo.history.size).toEqual(5)
        expect(repo.history.root.payload).toEqual(2)
        expect(repo.history.head.payload).toEqual(6)
      })
    })

    describe('extension', function () {
      it('extends custom defaults with Microcosm defaults', function () {
        expect.assertions(2)

        class Repo extends Microcosm {
          static defaults = {
            test: true
          }

          setup (options) {
            expect(options.maxHistory).toBe(0)
            expect(options.test).toBe(true)
          }
        }

        new Repo()
      })

      it('extends custom defaults with passed arguments', function () {
        expect.assertions(3)

        class Repo extends Microcosm {
          static defaults = {
            test: true
          }

          setup (options) {
            expect(options.maxHistory).toBe(10)
            expect(options.test).toBe(true)
            expect(options.instantiated).toBe(true)
          }
        }

        new Repo({ maxHistory: 10, instantiated: true })
      })
    })
  })
})
