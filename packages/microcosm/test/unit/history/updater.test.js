import Microcosm from 'microcosm'

describe.skip('History updater', function() {
  it('provides a default batching method', function(done) {
    const repo = new Microcosm({
      batch: true
    })

    let spy = jest.fn()

    repo.history.on('release', spy)

    repo.history.on('release', () => {
      expect(spy).toHaveBeenCalledTimes(1)
      done()
    })

    repo.append('action', 'resolve')
    repo.append('action', 'resolve')
    repo.append('action', 'resolve')
  })

  it('allows manual control over updates', function(done) {
    const repo = new Microcosm({
      updater: function() {
        return update => setTimeout(update, 10)
      }
    })

    repo.history.on('release', () => done())

    repo.append('action', 'resolve')
  })

  it('does not emit an update if update is not called', function() {
    const repo = new Microcosm({
      updater: function() {
        return update => {}
      }
    })

    repo.history.on('release', () => {
      throw new Error('Release should never have been called.')
    })

    repo.append('action', 'resolve')
    repo.append('action', 'resolve')
    repo.append('action', 'resolve')
  })

  it('.wait() waits for the updater', async function() {
    const repo = new Microcosm({
      updater: function() {
        return update => setTimeout(update, 0)
      }
    })

    let handler = jest.fn()

    repo.history.on('release', handler)

    repo.append('one').resolve()

    await repo.history.wait()

    expect(handler).toHaveBeenCalled()
  })

  it('.wait() ignores the updater when there is nothing to do', async function() {
    const repo = new Microcosm({
      updater: function() {
        return update => setTimeout(update, 10)
      }
    })

    await repo.history.wait()
  })

  it('.wait() waits for the updater even on rejection', function() {
    const repo = new Microcosm({
      updater: function() {
        return update => setTimeout(update, 0)
      }
    })

    let action = repo.append('action')

    let promise = repo.history.wait()

    action.reject('error')

    return promise.then(null, error => {
      expect(error).toEqual('error')
    })
  })
})
