import Microcosm from '../../../src/microcosm'

function delay(payload, n) {
  return new Promise(resolve => setTimeout(() => resolve(payload), n))
}

describe('Action link', function() {
  it('remembers and returns the results of each child action', async function() {
    const repo = new Microcosm()

    const action = repo.parallel([
      repo.push(() => delay(1, 20)),
      repo.push(() => delay(2, 10)),
      repo.push(() => delay(3, 5))
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
})
