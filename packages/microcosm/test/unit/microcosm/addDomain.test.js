import Microcosm, { reset } from 'microcosm'

describe('Microcosm::addDomain', function() {
  it('adding a domain backfills the initial state', function() {
    let repo = new Microcosm()

    repo.addDomain('a', {
      getInitialState() {
        return 0
      }
    })

    expect(repo).toHaveState('a', 0)

    repo.addDomain('b', {
      getInitialState() {
        return 1
      }
    })

    expect(repo).toHaveState('a', 0)
    expect(repo).toHaveState('b', 1)
  })

  it.dev('can not add domains to the root', function() {
    let repo = new Microcosm()

    expect(() => repo.addDomain('', {})).toThrow(
      'Can not add domain to root level.'
    )
  })

  describe('forks', function() {
    it('receives initial state from parents', function() {
      let repo = new Microcosm()

      repo.addDomain('a', {
        getInitialState() {
          return 0
        }
      })

      let fork = repo.fork()

      expect(repo).toHaveState('a', 0)
      expect(fork).toHaveState('a', 0)
    })

    it('adding a domain to a fork does not reset all state', function() {
      let repo = new Microcosm()

      repo.addDomain('a', {
        getInitialState() {
          return 0
        }
      })

      repo.push(reset, { a: 1 })

      expect(repo).toHaveState('a', 1)

      let fork = repo.fork()

      fork.addDomain('b', {
        getInitialState() {
          return 2
        }
      })

      expect(fork).toHaveState('a', 1)
      expect(fork).toHaveState('b', 2)
    })

    it('adding a domain to a parent sends initial state to forks', function() {
      let repo = new Microcosm()
      let fork = repo.fork()

      repo.addDomain('a', {
        getInitialState() {
          return 0
        }
      })

      repo.push(reset, { a: 1 })

      expect(repo).toHaveState('a', 1)
      expect(fork).toHaveState('a', 1)

      fork.addDomain('b', {
        getInitialState() {
          return 2
        }
      })
      expect(repo).toHaveState('a', 1)
      expect(fork).toHaveState('a', 1)

      expect(repo).not.toHaveState('b')
      expect(fork).toHaveState('b', 2)
    })

    it('adding a domain to a child does not modify a parent', function() {
      let repo = new Microcosm()
      let fork = repo.fork()

      repo.addDomain('a', {
        getInitialState() {
          return 0
        }
      })

      fork.addDomain('b', {
        getInitialState() {
          return 2
        }
      })

      expect(repo).not.toHaveState('b')
    })

    it.dev('can not add domains to keys managed by parents', function() {
      let repo = new Microcosm()
      let fork = repo.fork()

      repo.addDomain('test', {})

      expect(() => fork.addDomain('test', {})).toThrow(
        'Can not add domain for "test". This state is already managed.'
      )
    })
  })
})
