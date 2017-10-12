import { Microcosm, set } from 'microcosm'
import CompareTree from 'microcosm/addons/compare-tree'
import SOLAR_SYSTEM from './fixtures/solar-system'

class Repo extends Microcosm {
  setup() {
    this.addDomain('meta', {})
    this.addDomain('planets', {})
    this.addDomain('physics', {})
  }
}

describe('CompareTree', function() {
  let tree = null
  let repo = null

  beforeEach(function() {
    repo = new Repo({}, SOLAR_SYSTEM)
    tree = new CompareTree(repo.state)

    repo.on('change', tree.update, tree)
  })

  describe('::on', function() {
    it('passes the selected state into a compare', function() {
      expect.assertions(1)

      let next = set(SOLAR_SYSTEM, ['meta', 'selected'], 'jupiter')
      let handler = jest.fn()

      tree.on('meta.selected', handler)
      repo.reset(next)

      expect(handler).toHaveBeenCalledWith('jupiter')
    })

    it('passes every key in the query', function() {
      expect.assertions(1)

      let next = set(SOLAR_SYSTEM, ['meta', 'selected'], 'jupiter')
      let handler = jest.fn()

      tree.on('meta.selected,planets', handler)
      repo.reset(next)

      expect(handler).toHaveBeenCalledWith('jupiter', SOLAR_SYSTEM.planets)
    })

    it('only invokes a subscription once if given multiple key paths', function() {
      let a = set(SOLAR_SYSTEM, ['meta', 'selected'], 'jupiter')
      let b = set(a, ['meta', 'focused'], false)

      let handler = jest.fn()

      tree.on('meta.selected,meta.focused', handler)
      repo.reset(b)

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('can subscribe to an index in an array', function() {
      expect.assertions(1)

      let next = set(SOLAR_SYSTEM, ['planets', 3], false)

      tree.on('planets.3', planet => {
        expect(planet).toBe(false)
      })

      repo.reset(next)
    })

    it('handles moving from an empty state to a hydrated state', function() {
      expect.assertions(1)

      repo.reset({})

      tree.on('planets.3', planet => {
        expect(planet).toBe(SOLAR_SYSTEM.planets[3])
      })

      repo.reset(SOLAR_SYSTEM)
    })
  })

  describe('::off', function() {
    it('can remove a listener', function() {
      let handler = jest.fn()
      let next = set(tree.snapshot, 'meta', {})

      tree.on('meta', handler)
      tree.off('meta', handler)

      repo.reset(next)

      expect(handler).not.toHaveBeenCalled()
    })

    it('gracefully ignores removing a missing listener', function() {
      tree.off('meta', n => n)
    })

    it('removes the query node if there are no callbacks left', function() {
      let handler = jest.fn()
      let query = tree.on('meta', handler)

      tree.off('meta', handler)

      expect(query.id in tree.queries).toBe(false)
    })

    it('removes nodes without edges up the chain', function() {
      let handler = jest.fn()
      let query = tree.on('meta.selected', handler)

      tree.off('meta.selected', handler)

      expect(tree.nodes['meta.selected']).toBeUndefined()
      expect(tree.nodes['meta']).toBeUndefined()
      expect(tree.queries[query.id]).toBeUndefined()
    })

    it('does not remove parents with other compares', function() {
      let handler = jest.fn()
      let query = tree.on('meta.selected', handler)

      tree.on('meta.focused', handler)
      tree.off('meta.selected', handler)

      expect(tree.nodes['meta.selected']).toBeUndefined()
      expect(tree.nodes['meta.focused']).toBeDefined()
      expect(tree.nodes['meta']).toBeDefined()
      expect(tree.queries[query.id]).toBeUndefined()
    })

    it('removes the root node when there are no subscriptions', function() {
      let handler = jest.fn()

      tree.on('meta.selected', handler)

      expect('' in tree.nodes).toBe(true)

      tree.off('meta.selected', handler)

      expect('' in tree.nodes).toBe(false)
    })

    it('unsubscribing one listener does not remove another', function() {
      let one = jest.fn()
      let two = jest.fn()

      let next = set(repo.state, ['meta', 'selected'], {})

      tree.on('meta.selected', one)
      tree.on('meta.selected', two)

      tree.off('meta.selected', one)

      repo.reset(next)

      expect(one).not.toHaveBeenCalled()
      expect(two).toHaveBeenCalled()
    })

    it('gracefully handles parents missing an edge (which should never happen)', function() {
      let one = n => n
      let two = n => n

      tree.on('a.b.c', one)

      let query = tree.on('a.b', two)

      let aB = tree.nodes['a.b.c']
      aB.edges = aB.edges.filter(e => e === query)

      tree.off('a.b.c', one)

      expect('a' in tree.nodes).toBe(true)
      expect('a.b' in tree.nodes).toBe(true)
      expect('query:a.b' in tree.queries).toBe(true)
      expect('query:a.b.c' in tree.queries).not.toBe(true)
    })

    it('gracefully handles nodes that do not exist', function() {
      let callback = n => n

      tree.on('a.b.c', callback)
      tree.off('a.b.c', callback)

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
      tree.on('a.b.c', n => n)
      repo.reset({})
    })

    it('can traverse missing state keys', function() {
      let handler = jest.fn()

      tree.on('meta.selected', handler)

      repo.reset({ meta: null })

      expect(handler).toHaveBeenCalledWith(null)

      repo.reset({
        meta: { selected: true }
      })

      expect(handler).toHaveBeenCalledWith(true)
    })

    it('the root node does not get called twice if subscribing to two children', function() {
      expect.assertions(1)

      let a = set(repo.state, ['meta', 'selected'], 'jupiter')
      let b = set(a, ['meta', 'focused'], false)

      tree.on('meta.selected,meta.focused', () => {})

      tree.on('meta', function(meta) {
        expect(meta).toBe(b.meta)
      })

      repo.reset(b)
    })
  })
})
