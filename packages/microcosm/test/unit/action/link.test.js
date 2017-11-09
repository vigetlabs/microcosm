import { Microcosm } from 'microcosm'

function delay(payload, n) {
  return new Promise(resolve => setTimeout(() => resolve(payload), n))
}

const cancels = () => {
  return action => action.cancel()
}

const rejects = () => {
  return action => action.reject()
}

describe('Action link', function() {
  it('remembers and returns the results of each child action', async function() {
    const repo = new Microcosm()

    const action = repo.parallel([
      repo.push(() => delay(1, 20)),
      repo.push(() => delay(2, 10)),
      repo.push(() => delay(3, 15))
    ])

    let payload = await action

    expect(payload).toEqual([1, 2, 3])
  })

  it('resolves empty', async function() {
    const repo = new Microcosm()

    const action = repo.parallel([])

    let payload = await action

    expect(payload).toEqual([])
  })

  it('handles cancelled actions by just returning undefined in that position', function() {
    const repo = new Microcosm()

    const action = repo.parallel([
      repo.push(() => 1),
      repo.push(cancels),
      repo.push(() => 3)
    ])

    expect(action.payload).toEqual([1, undefined, 3])
  })

  it('rejects if any of the actions reject', function() {
    const repo = new Microcosm()

    const action = repo.parallel([
      repo.push(rejects),
      repo.push(() => 2),
      repo.push(() => 3)
    ])

    expect(action.status).toEqual('reject')
  })
})
