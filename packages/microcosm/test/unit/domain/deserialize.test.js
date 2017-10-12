import Microcosm from 'microcosm'

describe('Domain::deserialize', function() {
  it('to getInitialState when no deserialize method is provided', function() {
    const repo = new Microcosm()

    repo.addDomain('fiz', {
      getInitialState() {
        return true
      }
    })

    return repo.patch({}, true).onDone(function() {
      expect(repo).toHaveState('fiz', true)
    })
  })

  it('can deserialize a string', function() {
    const repo = new Microcosm()

    repo.addDomain('fiz', {
      deserialize(state) {
        return state.toUpperCase()
      }
    })

    let answer = repo.deserialize('{ "fiz": "buzz"}')

    expect(answer).toEqual({ fiz: 'BUZZ' })
  })

  describe('forks', function() {
    it('deserialize works from parents to children', function() {
      const parent = new Microcosm()
      const child = parent.fork()

      parent.addDomain('fiz', {
        deserialize: word => word.toLowerCase()
      })

      child.addDomain('buzz', {
        deserialize: word => word.toLowerCase()
      })

      const data = child.deserialize({ fiz: 'FIZ', buzz: 'BUZZ' })

      expect(data).toEqual({ fiz: 'fiz', buzz: 'buzz' })
    })
  })
})
