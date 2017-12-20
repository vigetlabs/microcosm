import Microcosm from 'microcosm'

describe('Action complete state', function() {
  it('will not change states if already complete', async () => {
    const repo = new Microcosm()

    let payload = await repo.push(function() {
      return observer => {
        observer.next('one')
        observer.complete()
        observer.next('two')
      }
    })

    expect(payload).toEqual('one')
  })
})
