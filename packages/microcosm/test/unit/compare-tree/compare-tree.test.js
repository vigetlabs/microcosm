import Microcosm, { set } from '../../../src/microcosm'
import SOLAR_SYSTEM from './fixtures/solar-system'

class Repo extends Microcosm {
  setup() {
    this.addDomain('meta', {})
    this.addDomain('planets', {})
    this.addDomain('physics', {})

    this.reset(SOLAR_SYSTEM)
  }
}

describe('CompareTree', function() {
  let tree = null
  let repo = null

  beforeEach(function() {
    repo = new Repo()
    tree = repo.changes
  })

  describe('::on', function() {
    it('passes the selected state into a compare', function() {
      expect.assertions(1)

      let next = set(SOLAR_SYSTEM, ['meta', 'selected'], 'jupiter')
      let handler = jest.fn()

      repo.on('change:meta.selected', handler)
      repo.reset(next)

      expect(handler).toHaveBeenCalledWith('jupiter')
    })

    it('passes every key in the query', function() {
      expect.assertions(1)

      let next = set(SOLAR_SYSTEM, ['meta', 'selected'], 'jupiter')
      let handler = jest.fn()

      repo.on('change:meta.selected,planets', handler)
      repo.reset(next)

      expect(handler).toHaveBeenCalledWith('jupiter', SOLAR_SYSTEM.planets)
    })

    it('only invokes a subscription once if given multiple key paths', function() {
      let a = set(SOLAR_SYSTEM, ['meta', 'selected'], 'jupiter')
      let b = set(a, ['meta', 'focused'], false)

      let handler = jest.fn()

      repo.on('change:meta.selected,meta.focused', handler)
      repo.reset(b)

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('can subscribe to an index in an array', function() {
      expect.assertions(1)

      let next = set(SOLAR_SYSTEM, ['planets', 3], false)

      repo.on('change:planets.3', planet => {
        expect(planet).toBe(false)
      })

      repo.reset(next)
    })

    it('handles moving from an empty state to a hydrated state', function() {
      expect.assertions(1)

      repo.reset({})

      repo.on('change:planets.3', planet => {
        expect(planet).toBe(SOLAR_SYSTEM.planets[3])
      })

      repo.reset(SOLAR_SYSTEM)
    })
  })

  describe('::off', function() {
    it('can remove a listener', function() {
      let handler = jest.fn()
      let next = set(tree.snapshot, 'meta', {})

      repo.on('change:meta', handler)
      repo.off('change:meta', handler)

      repo.reset(next)

      expect(handler).not.toHaveBeenCalled()
    })

    it('gracefully ignores removing a missing listener', function() {
      repo.off('change:meta', n => n)
    })

    it('removes the query node if there are no callbacks left', function() {
      let handler = jest.fn()
      let query = repo.on('change:meta', handler)

      repo.off('change:meta', handler)

      expect(query.id in tree.queries).toBe(false)
    })

    it('removes nodes without edges up the chain', function() {
      let handler = jest.fn()
      let query = repo.on('change:meta.selected', handler)

      repo.off('change:meta.selected', handler)

      expect(tree.nodes['meta.selected']).toBeUndefined()
      expect(tree.nodes['meta']).toBeUndefined()
      expect(tree.queries[query.id]).toBeUndefined()
    })

    it('does not remove parents with other compares', function() {
      let handler = jest.fn()
      let query = repo.on('change:meta.selected', handler)

      repo.on('change:meta.focused', handler)
      repo.off('change:meta.selected', handler)

      expect(tree.nodes['meta.selected']).toBeUndefined()
      expect(tree.nodes['meta.focused']).toBeDefined()
      expect(tree.nodes['meta']).toBeDefined()
      expect(tree.queries[query.id]).toBeUndefined()
    })

    it('removes the root node when there are no subscriptions', function() {
      let handler = jest.fn()

      repo.on('change:meta.selected', handler)

      expect('' in tree.nodes).toBe(true)

      repo.off('change:meta.selected', handler)

      expect('' in tree.nodes).toBe(false)
    })

    it('unsubscribing one listener does not remove another', function() {
      let one = jest.fn()
      let two = jest.fn()

      let next = set(repo.state, ['meta', 'selected'], {})

      repo.on('change:meta.selected', two)

      repo.off('change:meta.selected', one)

      repo.reset(next)

      expect(one).not.toHaveBeenCalled()
      expect(two).toHaveBeenCalled()
    })

    it('gracefully handles parents missing an edge (which should never happen)', function() {
      let one = n => n
      let two = n => n

      repo.on('change:a.b.c', one)

      let query = repo.on('change:a.b', two)

      let aB = tree.nodes['a.b.c']
      aB.edges = aB.edges.filter(e => e === query)

      repo.off('change:a.b.c', one)

      expect('a' in tree.nodes).toBe(true)
      expect('a.b' in tree.nodes).toBe(true)
      expect('query:a.b' in tree.queries).toBe(true)
      expect('query:a.b.c' in tree.queries).not.toBe(true)
    })

    it('gracefully handles nodes that do not exist', function() {
      let callback = n => n

      repo.on('change:a.b.c', callback)
      repo.off('change:a.b.c', callback)

      expect('a' in tree.nodes).toBe(false)
      expect('a.b' in tree.nodes).toBe(false)
      expect('a.b.c' in tree.nodes).toBe(false)
      expect('query:a.b.c' in tree.queries).toBe(false)
    })
  })

  describe('::connect', function() {
    it.dev('edges can not connect to themselves', function() {
      let node = tree.addNode('node')

      expect(function() {
        node.connect(node)
      }).toThrow('Unable to connect node ' + node.id + ' to self.')
    })
  })

  describe('::update', function() {
    it('can traverse compares for missing keys', function() {
      repo.on('change:a.b.c', n => n)
      repo.reset({})
    })

    it('can traverse missing state keys', function() {
      let handler = jest.fn()

      repo.on('change:meta.selected', handler)

      repo.reset({ meta: null })

      repo.reset({
        meta: { selected: true }
      })

      expect(handler).toHaveBeenCalledWith(null)
    })

    it('the root node does not get called twice if subscribing to two children', function() {
      expect.assertions(1)

      let a = set(repo.state, ['meta', 'selected'], 'jupiter')
      let b = set(a, ['meta', 'focused'], false)

      repo.on('change:meta.selected,meta.focused', () => {})

      repo.on('change:meta', function(meta) {
        expect(meta).toBe(b.meta)
      })

      repo.reset(b)
    })
  })
})
