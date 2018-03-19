import Microcosm from 'microcosm'

const reconstitute = obj => JSON.parse(JSON.stringify(obj))

describe('Domain::serialize', function() {
  it('runs through serialize methods on domains', function() {
    const repo = new Microcosm()

    repo.addDomain('test', {
      getInitialState() {
        return 'this will not display'
      },
      serialize() {
        return 'this is a test'
      }
    })

    expect(reconstitute(repo)).toHaveProperty('test', 'this is a test')
  })

  it('only includes keys that impliment serialize', function() {
    const repo = new Microcosm()

    repo.addDomain('missing', {
      getInitialState() {
        return true
      }
    })

    repo.addDomain('included', {
      getInitialState() {
        return 'howdy'
      },
      serialize(state) {
        return state.toUpperCase()
      }
    })

    let json = reconstitute(repo)

    expect(json).toHaveProperty('included', 'HOWDY')
    expect(json).not.toHaveProperty('missing')
  })

  describe('forks', function() {
    it('serialize works from parents to children', function() {
      const parent = new Microcosm()
      const child = parent.fork()

      parent.addDomain('fiz', {
        getInitialState: () => 'fiz',
        serialize: word => word.toUpperCase()
      })

      child.addDomain('buzz', {
        getInitialState: () => 'buzz',
        serialize: word => word.toUpperCase()
      })

      expect(reconstitute(child)).toEqual({ fiz: 'FIZ', buzz: 'BUZZ' })
    })
  })
})
