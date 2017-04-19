import History from '../../../src/history'

describe('History updater', function () {
  it('provides a default batching method', function (done) {
    const history = new History({
      batch: true,
    })

    let spy = jest.fn()

    history.on('release', spy)

    history.on('release', () => {
      expect(spy).toHaveBeenCalledTimes(1)
      done()
    })

    history.append('action').resolve()
    history.append('action').resolve()
    history.append('action').resolve()
  })

  it('allows manual control over updates', function (done) {
    const history = new History({
      updater: function () {
        return update => setTimeout(update, 10)
      },
    })

    history.on('release', () => done())

    history.append('action').resolve()
  })

  it('does not emit an update if update is not called', function () {
    const history = new History({
      updater: function () {
        return update => {}
      },
    })

    const spy = jest.spyOn(history, 'release')

    history.append('action').resolve()
    history.append('action').resolve()
    history.append('action').resolve()

    expect(spy).not.toHaveBeenCalled()
  })

  it('.wait() waits for the updater', async function () {
    const history = new History({
      updater: function () {
        return update => setTimeout(update, 10)
      },
    })

    let handler = jest.fn()

    history.on('release', handler)

    history.append('action').resolve()

    await history.wait()

    expect(handler).toHaveBeenCalled()
  })

  it('.wait() ignores the updater when there is nothing to do', async function () {
    const history = new History({
      updater: function () {
        return update => setTimeout(update, 10)
      },
    })

    await history.wait()
  })

  it('.wait() waits for the updater even on rejection', function () {
    const history = new History({
      updater: function () {
        return update => setTimeout(update, 10)
      },
    })

    let action = history.append('action')

    let promise = history.wait()

    action.reject('error')

    return promise.then(null, error => {
      expect(error).toEqual('error')
    })
  })
})
