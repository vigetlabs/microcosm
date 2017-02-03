import Microcosm from '../src/microcosm'

describe('indexing', function () {

  test('can save an index for later', function() {
    let repo = new Microcosm(null, { styles: { color: 'red' } })

    repo.reset({ styles: { color: 'red' } })

    repo.index('color', 'styles.color', state => state.styles.color)

    let color = repo.compute('color')

    expect(color).toEqual('red')
  })

  test('computing an index twice returns the same value', function () {
    let repo = new Microcosm({}, { styles: { color: 'red' } })

    repo.index('color', 'styles.color')

    let a = repo.compute('color')
    let b = repo.compute('color')

    expect(a).toEqual({ styles: { color: 'red' } })
    expect(a).toBe(b)
  })

  test('updates if state changes', function () {
    let repo = new Microcosm({}, { styles: { color: 'red' } })

    repo.index('color', 'styles.color', state => state.styles.color)

    let a = repo.compute('color')

    repo.patch({ styles: { color: 'blue' } })

    let b = repo.compute('color')

    expect(a).not.toBe(b)
    expect(b).toEqual('blue')
  })

  test('forks inherit indexes from parents', function () {
    let repo = new Microcosm({}, { styles: { color: 'red' } })
    
    repo.index('styles', 'styles')

    let child = repo.fork()

    let a = repo.compute('styles')
    let b = child.compute('styles')

    expect(a).toBe(b)
  })

})

describe('compute', function () {

  it('can perform additional data processing on indexes', function () {
    let repo = new Microcosm({}, { styles: { color: 'red' } })

    repo.index('color', 'styles.color', state => state.styles.color)

    let value = repo.compute('color', color => color.toUpperCase())

    expect(value).toEqual('RED')
  })

  it('raises an exception if an index is missing', function () {
    let repo = new Microcosm()

    expect(function () {
      repo.compute('missing')
    }).toThrow('Unable to find missing index missing')
  })

})

describe('memo', function () {

  it('returns the same result if state has not changed', function () {
    let repo = new Microcosm({}, { styles: { color: 'red' } })

    repo.index('color', 'styles.color', state => state.styles.color)

    let query = repo.memo('color', value => value.toUpperCase())

    let a = query()
    let b = query()

    expect(a).toEqual('RED')
    expect(a).toBe(b)
  })

  it('does not recalculate processors if the index has not changed', function () {
    let repo = new Microcosm({}, { styles: { color: 'red' } })
    let toUpperCase = jest.fn(value => value.toUpperCase())

    repo.index('color', 'styles.color', state => state.styles.color)

    let query = repo.memo('color', toUpperCase)

    let a = query()
    let b = query()

    expect(toUpperCase).toHaveBeenCalledTimes(1)
  })

  it('returns a new result if state has changed', function () {
    let repo = new Microcosm({}, { styles: { color: 'red' } })

    repo.index('color', 'styles.color', state => state.styles.color)

    let query = repo.memo('color', color => color.toUpperCase())

    let a = query()

    repo.patch({ styles: { color: 'blue' }})
    
    let b = query()

    expect(a).toEqual('RED')
    expect(b).toEqual('BLUE')
  })

  it('queries may run multiple processors', function () {
    let repo = new Microcosm({}, { styles: { color: 'red' } })

    repo.index('color', 'styles.color', state => state.styles.color)

    let query = repo.memo('color',
                          color => color.toUpperCase(),
                          color => color + ' - test')

    expect(query()).toEqual('RED - test')
  })

  it('the result of processing one memo does not effect another', function () {
    let repo = new Microcosm()
    
    repo.patch({ color: 'blue' })

    repo.index('color', 'color', state => state.color)

    let one = repo.memo('color', n => null)
    let two = repo.memo('color', n => n.toUpperCase())
    
    expect(one()).toEqual(null)
    expect(two()).toEqual('BLUE')
  })

})
