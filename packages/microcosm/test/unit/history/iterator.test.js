import Microcosm, { Observable } from 'microcosm'

describe('History @@iterator', function() {
  it('works with Array.from', function() {
    let repo = new Microcosm({ debug: true })

    repo.push('one')
    repo.push('two')

    let list = Array.from(repo.history)

    expect(list.map(i => i.meta.key)).toEqual(['one', 'two'])
  })

  it('works with for...of', function() {
    let repo = new Microcosm({ debug: true })

    repo.push('one')
    repo.push('two')

    let list = []

    for (var action of repo.history) {
      list.push(action.meta.key)
    }

    expect(list).toEqual(['one', 'two'])
  })

  it('works with Promise.all', async function() {
    let repo = new Microcosm({ debug: true })

    repo.push(() => Promise.resolve('one'))
    repo.push(() => Promise.resolve('two'))

    await Promise.all(repo.history)

    expect(repo.history.size).toBe(2)

    for (var action of repo.history) {
      expect(action.meta.status).toBe('complete')
    }
  })

  it('works with Observable.of', function() {
    let repo = new Microcosm({ debug: true })

    repo.push(() => Promise.resolve('one'))
    repo.push(() => Promise.resolve('two'))
    let complete = jest.fn()

    Observable.of(repo.history).subscribe({ complete })

    expect(complete).toHaveBeenCalled()
  })
})
