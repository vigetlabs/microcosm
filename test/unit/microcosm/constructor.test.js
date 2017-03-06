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

  describe('option: maxHistory', function () {

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

})
