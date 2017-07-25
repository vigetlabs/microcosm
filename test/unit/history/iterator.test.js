import History from '../../../src/history'
import Observable from 'zen-observable'

describe('History @@iterator', function() {
  it('works with Array.from', function() {
    let history = new History({ maxHistory: Infinity })

    history.append('one', 'resolve')
    history.append('two', 'resolve')

    let list = Array.from(history)

    expect(list.map(i => i.type)).toEqual(['one', 'two'])
  })

  it('works with for...of', function() {
    let history = new History({ maxHistory: Infinity })

    history.append('one', 'resolve')
    history.append('two', 'resolve')

    let list = []

    for (var action of history) {
      list.push(action.type)
    }

    expect(list).toEqual(['one', 'two'])
  })

  it('works with Promise.all', async function() {
    let history = new History({ maxHistory: Infinity })

    let one = history.append('one', 'resolve')
    let two = history.append('two', 'resolve')

    let promise = Promise.all(history)

    one.resolve()
    two.resolve()

    // Basically, this should complete
    await promise.then(() => {
      for (var action of history) {
        expect(action).toHaveStatus('resolve')
      }
    })
  })

  it('works with Observable.of', function() {
    let history = new History({ maxHistory: Infinity })

    let one = history.append('one', 'resolve')
    let two = history.append('two', 'resolve')
    let complete = jest.fn()

    Observable.of(history).subscribe({ complete })

    one.resolve()
    two.resolve()

    expect(complete).toHaveBeenCalled()
  })
})
