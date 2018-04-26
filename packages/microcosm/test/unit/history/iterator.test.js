import { Microcosm, Observable, scheduler } from 'microcosm'

describe('History @@iterator', () => {
  it('works with Array.from', async () => {
    let repo = new Microcosm({ debug: true })

    await repo.push('one')
    await repo.push('two')

    let list = Array.from(repo.history)

    expect(list.map(i => i.meta.key)).toEqual(['one', 'two'])
  })

  it('works with for...of', async () => {
    let repo = new Microcosm({ debug: true })

    await repo.push('one')
    await repo.push('two')

    let list = []

    for (var action of repo.history) {
      list.push(action.meta.key)
    }

    expect(list).toEqual(['one', 'two'])
  })

  it('works with Promise.all', async () => {
    let repo = new Microcosm({ debug: true })

    await repo.push(() => Promise.resolve('one'))
    await repo.push(() => Promise.resolve('two'))
    await Promise.all(repo.history)

    expect(repo.history.size).toBe(2)

    for (var action of repo.history) {
      expect(action.meta.status).toBe('complete')
    }
  })

  it('works with Observable.of', async () => {
    let repo = new Microcosm({ debug: true })
    let complete = jest.fn()

    await repo.push(() => Promise.resolve('one'))
    await repo.push(() => Promise.resolve('two'))

    Observable.of(repo.history).subscribe({ complete })

    await scheduler()

    expect(complete).toHaveBeenCalled()
  })
})
