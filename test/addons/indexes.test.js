import Microcosm from '../../src/microcosm'
import Indexing from '../../src/addons/indexing'

Indexing()

class Repo extends Microcosm {
  setup() {
    this.addDomain('styles', {
      getInitialState() {
        return { color: 'red' }
      }
    })
  }
}

describe('indexing', function() {
  it('can save an index for later', function() {
    let repo = new Repo()

    repo.index('color', 'styles.color', state => state.styles.color)

    let color = repo.compute('color')

    expect(color).toEqual('red')
  })

  it('computing an index twice returns the same value', function() {
    let repo = new Repo()

    repo.index('styles', 'styles.color')

    let a = repo.compute('styles')
    let b = repo.compute('styles')

    expect(a).toEqual({ styles: { color: 'red' } })
    expect(a).toBe(b)
  })

  it('computing an index from the same state fragment returns the same value', function() {
    let repo = new Repo()

    repo.addDomain('another', {
      getInitialState() {
        return true
      }
    })

    repo.index('color', 'styles.color')

    let a = repo.compute('color')

    repo.patch({ another: false })

    let b = repo.compute('color')

    expect(a).toEqual({ styles: { color: 'red' } })
    expect(a).toBe(b)
  })

  it('updates if state changes', function() {
    let repo = new Repo()

    repo.index('color', 'styles.color', state => state.styles.color)

    let a = repo.compute('color')

    repo.patch({ styles: { color: 'blue' } })

    let b = repo.compute('color')

    expect(a).not.toBe(b)
    expect(b).toEqual('blue')
  })

  it('forks inherit indexes from parents', function() {
    let repo = new Repo()

    repo.index('styles', 'styles')

    let child = repo.fork()

    let a = repo.compute('styles')
    let b = child.compute('styles')

    expect(a).toBe(b)
  })
})

describe('compute', function() {
  it('can perform additional data processing on indexes', function() {
    let repo = new Repo()

    repo.index('color', 'styles.color', state => state.styles.color)

    let value = repo.compute('color', color => color.toUpperCase())

    expect(value).toEqual('RED')
  })

  it.strict('raises an exception if an index is missing', function() {
    let repo = new Microcosm()

    expect(function() {
      repo.compute('missing')
    }).toThrow('Unable to find missing index missing')
  })
})

describe('memo', function() {
  it('returns the same result if state has not changed', function() {
    let repo = new Repo()

    repo.index('color', 'styles.color', state => state.styles.color)

    let query = repo.memo('color', value => value.toUpperCase())

    let a = query()
    let b = query()

    expect(a).toEqual('RED')
    expect(a).toBe(b)
  })

  it('does not recalculate processors if the index has not changed', function() {
    let repo = new Repo()
    let toUpperCase = jest.fn(value => value.toUpperCase())

    repo.index('color', 'styles.color', state => state.styles.color)

    let query = repo.memo('color', toUpperCase)

    query()
    query()

    expect(toUpperCase).toHaveBeenCalledTimes(1)
  })

  it('returns a new result if state has changed', function() {
    let repo = new Repo()

    repo.index('color', 'styles.color', state => state.styles.color)

    let query = repo.memo('color', color => color.toUpperCase())

    let a = query()

    repo.patch({ styles: { color: 'blue' } })

    let b = query()

    expect(a).toEqual('RED')
    expect(b).toEqual('BLUE')
  })

  it('queries may run multiple processors', function() {
    let repo = new Repo()

    repo.index('color', 'styles.color', state => state.styles.color)

    let query = repo.memo(
      'color',
      color => color.toUpperCase(),
      color => color + ' - it'
    )

    expect(query()).toEqual('RED - it')
  })

  it('the result of processing one memo does not effect another', function() {
    let repo = new Repo({}, { styles: { color: 'blue' } })

    repo.index('color', 'styles.color', state => state.styles.color)

    let one = repo.memo('color', n => null)
    let two = repo.memo('color', n => n.toUpperCase())

    expect(one()).toEqual(null)
    expect(two()).toEqual('BLUE')
  })
})
