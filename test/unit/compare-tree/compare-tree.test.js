import CompareTree from '../../../src/compare-tree'
import { set } from '../../../src/utils'
import SOLAR_SYSTEM from './fixtures/solar-system'

describe('CompareTree', function() {
  let tree = null

  beforeEach(function() {
    tree = new CompareTree(SOLAR_SYSTEM)
  })

  describe('::on', function() {
    it('passes the selected state into a compare', function() {
      expect.assertions(1)

      let next = set(SOLAR_SYSTEM, ['meta', 'selected'], 'jupiter')
      let handler = jest.fn()

      tree.on('meta.selected', handler)
      tree.update(next)

      expect(handler).toHaveBeenCalledWith('jupiter')
    })

    it('passes every key in the query', function() {
      expect.assertions(1)

      let next = set(SOLAR_SYSTEM, ['meta', 'selected'], 'jupiter')
      let handler = jest.fn()

      tree.on('meta.selected,planets', handler)
      tree.update(next)

      expect(handler).toHaveBeenCalledWith('jupiter', SOLAR_SYSTEM.planets)
    })

    it('returns the same node given the same path', function() {
      expect.assertions(1)

      let a = tree.on('meta.selected', jest.fn())
      let b = tree.on('meta.selected', jest.fn())

      expect(a).toBe(b)
    })

    it('only invokes a subscription once if given multiple key paths', function() {
      let a = set(SOLAR_SYSTEM, ['meta', 'selected'], 'jupiter')
      let b = set(a, ['meta', 'focused'], false)

      let handler = jest.fn()

      tree.on(['meta.selected', 'meta.focused'], handler)
      tree.update(b)

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('can subscribe to an index in an array', function() {
      expect.assertions(1)

      let tree = new CompareTree(SOLAR_SYSTEM)
      let next = set(SOLAR_SYSTEM, ['planets', 3], false)

      tree.on('planets.3', planet => {
        expect(planet).toBe(false)
      })

      tree.update(next)
    })

    it('handles moving from an empty state to a hydrated state', function() {
      expect.assertions(1)

      let tree = new CompareTree({})

      tree.on('planets.3', planet => {
        expect(planet).toBe(SOLAR_SYSTEM.planets[3])
      })

      tree.update(SOLAR_SYSTEM)
    })

    describe('subscribing to the root', function() {
      it('can subscribe to the root', function() {
        expect.assertions(1)

        let next = {}
        let handler = jest.fn()

        tree.on('', handler)

        tree.update(next)

        expect(handler).toHaveBeenCalledWith(next)
      })

      it('unsubscribe from the root', function() {
        expect.assertions(1)

        let next = {}
        let handler = jest.fn()

        tree.on('', handler)
        tree.off('', handler)

        tree.update(next)

        expect(handler).not.toHaveBeenCalledWith()
      })
    })
  })

  describe('::off', function() {
    it('can remove a listener', function() {
      let handler = jest.fn()
      let next = set(tree.snapshot, 'meta', {})

      tree.on('meta', handler)
      tree.off('meta', handler)

      tree.update(next)

      expect(handler).not.toHaveBeenCalled()
    })

    it('gracefully ignores removing a missing listener', function() {
      tree.off('meta', n => n)
    })

    it('removes the query node if there are no callbacks left', function() {
      let handler = jest.fn()
      let query = tree.on('meta', handler)

      tree.off('meta', handler)

      expect(tree.nodes[query.id]).toBeUndefined()
    })

    it('removes nodes without edges up the chain', function() {
      let handler = jest.fn()
      let query = tree.on('meta.selected', handler)

      tree.off('meta.selected', handler)

      expect(tree.nodes[query.id]).toBeUndefined()
      expect(tree.nodes['meta.selected']).toBeUndefined()
      expect(tree.nodes['meta']).toBeUndefined()
    })

    it('does not remove parents with other compares', function() {
      let handler = jest.fn()
      let query = tree.on('meta.selected', handler)

      tree.on('meta.focused', handler)
      tree.off('meta.selected', handler)

      expect(tree.nodes[query.id]).toBeUndefined()
      expect(tree.nodes['meta.selected']).toBeUndefined()
      expect(tree.nodes['meta.focused']).toBeDefined()
      expect(tree.nodes['meta']).toBeDefined()
    })

    it('removes the root node when there are no subscriptions', function() {
      let handler = jest.fn()

      tree.on('meta.selected', handler)

      // 'root', 'meta', 'selected', 'handler'
      expect(Object.keys(tree.nodes)).toHaveLength(4)

      tree.off('meta.selected', handler)

      expect(Object.keys(tree.nodes)).toHaveLength(0)
    })

    it('keeps a query if it still has compares left', function() {
      let one = jest.fn()
      let two = jest.fn()

      let next = set(tree.snapshot, ['meta', 'selected'], {})
      let query = tree.on('meta.selected', one)

      tree.on('meta.selected', two)

      tree.off('meta.selected', one)

      tree.update(next)

      expect(one).not.toHaveBeenCalled()
      expect(two).toHaveBeenCalled()

      expect(tree.nodes[query.id]).toBeDefined()
    })

    it('gracefully handles parents missing an edge (which should never happen)', function() {
      let one = n => n
      let two = n => n

      tree.on('a.b.c', one)

      let query = tree.on('a.b', two)

      let aB = tree.nodes['a.b.c']
      aB.edges = aB.edges.filter(e => e === query)

      tree.off('a.b.c', one)

      let keys = Object.keys(tree.nodes)

      expect(keys).toContain('a')
      expect(keys).toContain('a.b')
      expect(keys).toContain('query:a.b')
      expect(keys).not.toContain('query:a.b.c')
    })

    it('gracefully handles compares that do not exist', function() {
      tree.on('a.b.c', n => n)
      tree.off('a.b.c', n => n)

      let keys = Object.keys(tree.nodes)

      expect(keys).toContain('a')
      expect(keys).toContain('a.b')
      expect(keys).toContain('a.b.c')
      expect(keys).toContain('query:a.b.c')
    })
  })

  describe('::connect', function() {
    it('edges can not connect to themselves', function() {
      let node = tree.addNode('node')

      node.connect(node)

      expect(node.edges).not.toContain(node)
    })
  })

  describe('::update', function() {
    it('can traverse compares for missing keys', function() {
      tree.on('a.b.c', n => n)
      tree.update({})
    })

    it('can traverse missing state keys', function() {
      let handler = jest.fn()

      tree.on('meta.selected', handler)

      tree.update({ meta: null })

      tree.update({
        meta: { selected: true }
      })

      expect(handler).toHaveBeenCalledWith(undefined)
    })

    it('the root node does not get called twice if subscribing to two children', function() {
      expect.assertions(1)

      let a = set(SOLAR_SYSTEM, ['meta', 'selected'], 'jupiter')
      let b = set(a, ['meta', 'focused'], false)

      tree.on(['meta.selected', 'meta.focused'], () => {})

      tree.on('meta', function(meta) {
        expect(meta).toBe(b.meta)
      })

      tree.update(b)
    })
  })

  describe('keyPaths', function() {
    it('allows a simple string', function() {
      tree.on('meta.selected', jest.fn())

      expect(tree.nodes['meta']).toBeDefined()
      expect(tree.nodes['meta.selected']).toBeDefined()
      expect(tree.nodes['query:meta.selected']).toBeDefined()
    })

    it('allows a simple, comma separated string', function() {
      tree.on('meta.selected,meta.focused', jest.fn())

      expect(tree.nodes['meta']).toBeDefined()
      expect(tree.nodes['meta.selected']).toBeDefined()
      expect(tree.nodes['meta.focused']).toBeDefined()
      expect(tree.nodes['query:meta.selected,meta.focused']).toBeDefined()
    })

    it('allows arrays of paths', function() {
      tree.on([['meta', 'selected']], jest.fn())

      expect(tree.nodes['meta']).toBeDefined()
      expect(tree.nodes['meta.selected']).toBeDefined()
      expect(tree.nodes['query:meta.selected']).toBeDefined()
    })

    it('allows arrays of strings', function() {
      tree.on(['meta.selected', 'planets'], jest.fn())

      let keys = Object.keys(tree.nodes)

      expect(keys).toContain('planets')
      expect(keys).toContain('meta')
      expect(keys).toContain('meta.selected')
      expect(keys).toContain('query:meta.selected,planets')
    })
  })
})
