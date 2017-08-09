import Microcosm from '../../../src/microcosm'

describe('History::toArray', function() {
  const action = n => n

  it('does not walk past the head', function() {
    const repo = new Microcosm()

    let one = repo.append('one')

    repo.append('two')
    repo.append('three')
    repo.checkout(one)

    repo.history.archive()

    expect(`${repo.history.toArray()}`).toEqual('one')
  })

  it('only walks through the main timeline', function() {
    const repo = new Microcosm()

    const first = repo.append('first')

    repo.append(action)

    repo.checkout(first)

    const third = repo.append('second')

    repo.history.archive()

    expect(`${repo.history.toArray()}`).toEqual('first,second')
  })
})
