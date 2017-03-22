import CompareTree from '../../../src/compare-tree'
import { set } from '../../../src/utils'
import SOLAR_SYSTEM from './fixtures/solar-system'

describe('CompareTree', function () {
  beforeEach(function () {
    this.tree = new CompareTree(SOLAR_SYSTEM)
  })

  describe('::on', function () {
    it('passes the selected state into a compare', function () {
      expect.assertions(1)

      let next = set(SOLAR_SYSTEM, ['meta', 'selected'], 'jupiter')
      let handler = jest.fn()

      this.tree.on('meta.selected', handler)
      this.tree.update(next)

      expect(handler).toHaveBeenCalledWith('jupiter')
    })

    it('passes every key in the query', function () {
      expect.assertions(1)

      let next = set(SOLAR_SYSTEM, ['meta', 'selected'], 'jupiter')
      let handler = jest.fn()

      this.tree.on('meta.selected,planets', handler)
      this.tree.update(next)

      expect(handler).toHaveBeenCalledWith('jupiter', SOLAR_SYSTEM.planets)
    })

    it('returns the same node given the same path', function () {
      expect.assertions(1)

      let a = this.tree.on('meta.selected', jest.fn())
      let b = this.tree.on('meta.selected', jest.fn())

      expect(a).toBe(b)
    })

    it('only invokes a CompareTree once if given multiple compares', function () {
      let a = set(SOLAR_SYSTEM, ['meta', 'selected'], 'jupiter')
      let b = set(a, ['meta', 'focused'], false)

      let handler = jest.fn()

      this.tree.on(['meta.selected', 'meta.focused'], handler)
      this.tree.update(b)

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('can subscribe to an index in an array', function () {
      expect.assertions(1)

      let tree = new CompareTree(SOLAR_SYSTEM)
      let next = set(SOLAR_SYSTEM, ['planets', 3], false)

      tree.on('planets.3', (planet) => {
        expect(planet).toBe(false)
      })

      tree.update(next)
    })

    it('handles moving from an empty state to a hydrated state', function () {
      expect.assertions(1)

      let tree = new CompareTree({})

      tree.on('planets.3', (planet) => {
        expect(planet).toBe(SOLAR_SYSTEM.planets[3])
      })

      tree.update(SOLAR_SYSTEM)
    })

    describe('subscribing to the root', function () {

      it('can subscribe to the root', function () {
        expect.assertions(1)

        let next = {}
        let handler = jest.fn()

        this.tree.on('', handler)

        this.tree.update(next)

        expect(handler).toHaveBeenCalledWith(next)
      })

      it('unsubscribe from the root', function () {
        expect.assertions(1)

        let next = {}
        let handler = jest.fn()

        this.tree.on('', handler)
        this.tree.off('', handler)

        this.tree.update(next)

        expect(handler).not.toHaveBeenCalledWith()
      })

    })

  })

  describe('::off', function () {

    it('can remove a listener', function () {
      let handler = jest.fn()
      let next = set(this.tree.snapshot, 'meta', {})

      this.tree.on('meta', handler)
      this.tree.off('meta', handler)

      this.tree.update(next)

      expect(handler).not.toHaveBeenCalled()
    })

    it('gracefully ignores removing a missing listener', function () {
      this.tree.off('meta', n => n)
    })

    it('removes the query node if there are no callbacks left', function () {
      let handler = jest.fn()
      let query = this.tree.on('meta', handler)

      this.tree.off('meta', handler)

      expect(this.tree.nodes[query.id]).toBeUndefined()
    })

    it('removes nodes without edges up the chain', function () {
      let handler = jest.fn()
      let query = this.tree.on('meta.selected', handler)

      this.tree.off('meta.selected', handler)

      expect(this.tree.nodes[query.id]).toBeUndefined()
      expect(this.tree.nodes['meta.selected']).toBeUndefined()
      expect(this.tree.nodes['meta']).toBeUndefined()
    })

    it('does not remove parents with other compares', function () {
      let handler = jest.fn()
      let query = this.tree.on('meta.selected', handler)

      this.tree.on('meta.focused', handler)
      this.tree.off('meta.selected', handler)

      expect(this.tree.nodes[query.id]).toBeUndefined()
      expect(this.tree.nodes['meta.selected']).toBeUndefined()
      expect(this.tree.nodes['meta.focused']).toBeDefined()
      expect(this.tree.nodes['meta']).toBeDefined()
    })

    it('keeps the root node in tact', function () {
      let handler = jest.fn()

      this.tree.on('meta.selected', handler)

      // 'root', 'meta', 'selected', 'handler'
      expect(Object.keys(this.tree.nodes)).toHaveLength(4)

      this.tree.off('meta.selected', handler)

      expect(Object.keys(this.tree.nodes)).toEqual(['~'])
    })

    it('keeps a query if it still has compares left', function () {
      let one = jest.fn()
      let two = jest.fn()

      let next = set(this.tree.snapshot, ['meta', 'selected'], {})
      let query = this.tree.on('meta.selected', one)

      this.tree.on('meta.selected', two)

      this.tree.off('meta.selected', one)

      this.tree.update(next)

      expect(one).not.toHaveBeenCalled()
      expect(two).toHaveBeenCalled()

      expect(this.tree.nodes[query.id]).toBeDefined()
    })

    it('gracefully handles parents missing an edge (which should never happen)', function () {
      let one = n => n
      let two = n => n

      this.tree.on('a.b.c', one)

      let query = this.tree.on('a.b', two)

      let aB = this.tree.nodes['a.b.c']
      aB.edges = aB.edges.filter(e => e === query)

      this.tree.off('a.b.c', one)

      let keys = Object.keys(this.tree.nodes)

      expect(keys).toContain('a')
      expect(keys).toContain('a.b')
      expect(keys).toContain('query:a.b')
      expect(keys).not.toContain('query:a.b.c')
    })

    it('gracefully handles compares that do not exist', function () {
      this.tree.on('a.b.c', n => n)
      this.tree.off('a.b.c', n => n)

      let keys = Object.keys(this.tree.nodes)

      expect(keys).toContain('a')
      expect(keys).toContain('a.b')
      expect(keys).toContain('a.b.c')
      expect(keys).toContain('query:a.b.c')
    })
  })

  describe('::connect', function () {

    it('edges can not connect to themselves', function () {
      let node = this.tree.addNode('node')

      node.connect(node)

      expect(node.edges).not.toContain(node)
    })

  })

  describe('::update', function () {
    it('can traverse compares for missing keys', function () {
      this.tree.on('a.b.c', n => n)
      this.tree.update({})
    })

    it('can traverse missing state keys', function () {
      this.tree.on('meta.selected', n => n)

      this.tree.update({ meta: null })

      this.tree.update({
        meta: { selected: true }
      })
    })

    it('the root node does not get called twice if subscribing to two children', function () {
      expect.assertions(1)

      let a = set(SOLAR_SYSTEM, ['meta', 'selected'], 'jupiter')
      let b = set(a, ['meta', 'focused'], false)

      this.tree.on(['meta.selected', 'meta.focused'], () => {})

      this.tree.on('meta', function (meta) {
        expect(meta).toBe(b.meta)
      })

      this.tree.update(b)
    })

  })

  describe('keyPaths', function () {
    it('allows a simple string', function () {
      this.tree.on('meta.selected', jest.fn())

      expect(this.tree.nodes['meta']).toBeDefined()
      expect(this.tree.nodes['meta.selected']).toBeDefined()
      expect(this.tree.nodes['query:meta.selected']).toBeDefined()
    })

    it('allows a simple, comma separated string', function () {
      this.tree.on('meta.selected,meta.focused', jest.fn())

      expect(this.tree.nodes['meta']).toBeDefined()
      expect(this.tree.nodes['meta.selected']).toBeDefined()
      expect(this.tree.nodes['meta.focused']).toBeDefined()
      expect(this.tree.nodes['query:meta.selected,meta.focused']).toBeDefined()
    })

    it('allows arrays of paths', function () {
      this.tree.on([['meta', 'selected']], jest.fn())

      expect(this.tree.nodes['meta']).toBeDefined()
      expect(this.tree.nodes['meta.selected']).toBeDefined()
      expect(this.tree.nodes['query:meta.selected']).toBeDefined()
    })

    it('allows arrays of strings', function () {
      this.tree.on(['meta.selected', 'planets'], jest.fn())

      let keys = Object.keys(this.tree.nodes)

      expect(keys).toContain('planets')
      expect(keys).toContain('meta')
      expect(keys).toContain('meta.selected')
      expect(keys).toContain('query:meta.selected,planets')
    })
  })

})
