import Microcosm from 'microcosm'
import Observable from 'zen-observable'

describe('History @@iterator', function() {
  it('works with Array.from', function() {
    let repo = new Microcosm({ maxHistory: Infinity })

    repo.append('one', 'resolve')
    repo.append('two', 'resolve')

    let list = Array.from(repo.history)

    expect(list.map(i => i.type)).toEqual(['one', 'two'])
  })

  it('works with for...of', function() {
    let repo = new Microcosm({ maxHistory: Infinity })

    repo.append('one', 'resolve')
    repo.append('two', 'resolve')

    let list = []

    for (var action of repo.history) {
      list.push(action.type)
    }

    expect(list).toEqual(['one', 'two'])
  })

  it('works with Promise.all', async function() {
    let repo = new Microcosm({ maxHistory: Infinity })

    let one = repo.push('one')
    let two = repo.push('two')

    let promise = Promise.all(repo.history)

    one.resolve()
    two.resolve()

    // Basically, this should complete
    await promise.then(() => {
      for (var action of repo.history) {
        expect(action).toHaveStatus('resolve')
      }
    })
  })

  it('works with Observable.of', function() {
    let repo = new Microcosm({ maxHistory: Infinity })

    let one = repo.push('one')
    let two = repo.push('two')
    let complete = jest.fn()

    Observable.of(repo.history).subscribe({ complete })

    one.resolve()
    two.resolve()

    expect(complete).toHaveBeenCalled()
  })
})
