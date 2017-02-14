import Action from '../src/action'
import Microcosm from '../src/microcosm'

const identity = n => n

it('an action payload is undefined by default', function () {
  const action = new Action('test').resolve()

  expect(action.payload).toBe(undefined)
})

it('an action can intentionally be set to undefined', function () {
  const action = new Action('test')

  action.open(true)
  action.resolve(undefined)

  expect(action.payload).toBe(undefined)
})

it('actions can be tested externally', function () {
  const repo = new Microcosm()
  const identity = n => n

  repo.addDomain('test', {
    register () {
      return {
        [identity.open] : () => 'open',
        [identity.done] : () => 'done'
      }
    }
  })

  repo.append(identity).open()
  expect(repo.state.test).toBe('open')

  repo.append(identity).resolve()
  expect(repo.state.test).toBe('done')
})

it('handles listeners with no callback', function () {
  const action = new Action(n => n)

  action.onDone()
  action.onError()
  action.onCancel()
  action.onUpdate()
})

describe('open state', function () {

  it('exposes an open type when opened', function () {
    const action = new Action(identity)

    action.open()

    expect(action.is('open')).toBe(true)
  })

  it('triggers an open event when it opens', function () {
    const action = new Action(identity)
    const callback = jest.fn()

    action.once('open', callback)
    action.open(3)

    expect(callback).toHaveBeenCalledWith(3)
  })

  it('actions are no longer disabled when opened', function () {
    const action = new Action(identity)

    action.open(true)

    expect(action.disabled).toBe(false)
    expect(action.is('open')).toBe(true)
  })

  it('does not trigger an open event if it is disposable', function () {
    const action = new Action(identity)
    const spy = jest.fn()

    action.on('open', spy)
    action.resolve()
    action.open()

    expect(spy).not.toHaveBeenCalled()
  })

})

describe('update state', function () {

  it('exposes a loading type when in progress', function () {
    const action = new Action(identity)

    action.update()

    expect(action).toHaveStatus('loading')
  })

  it('listens to progress updates', function () {
    const action = new Action(identity)
    const fn = jest.fn()

    action.onUpdate(fn)
    action.update(true)

    expect(fn).toHaveBeenCalledWith(true)
  })

  it('does not trigger onUpdate if in progress', function () {
    const action = new Action(identity)
    const fn = jest.fn()

    action.update(true)
    action.onUpdate(fn)

    expect(fn).not.toHaveBeenCalled()
  })

  it('actions are no longer open when in progress', function () {
    const action = new Action(identity)

    action.open(true)
    action.update(true)

    expect(action).not.toHaveStatus('open')
    expect(action).toHaveStatus('loading')
  })

  it('triggers an update event when it sends', function () {
    const action = new Action(identity)
    const callback = jest.fn()

    action.once('update', callback)
    action.update(3)

    expect(callback).toHaveBeenCalledWith(3)
  })

  it('does not trigger an update event if it is disposable', function () {
    const action = new Action(identity)
    const spy = jest.fn()

    action.on('update', spy)
    action.resolve()
    action.update()

    expect(spy).not.toHaveBeenCalled()
  })

  it('aliases the loading type with update', function () {
    const action = new Action(identity)

    action.update()

    expect(action).toHaveStatus('update')
  })
})

describe('disabled state', function () {

  it('preserves other states when disabled', function () {
    const action = new Action(identity)

    action.resolve()
    action.toggle()

    expect(action).toHaveStatus('done')
  })

  it('is toggleable', function () {
    const action = new Action(identity)

    action.resolve()
    expect(action.disabled).toBe(false)

    action.toggle()
    expect(action.disabled).toBe(true)
  })

})

describe('resolved state', function () {

  it('exposes a done type when completed', function () {
    const action = new Action(identity)

    action.resolve()

    expect(action).toHaveStatus('done')
  })

  it('triggers a done event when it resolves', function () {
    const action = new Action(identity)
    const callback = jest.fn()

    action.once('resolve', callback)
    action.resolve(3)

    expect(callback).toHaveBeenCalledWith(3)
  })

  it('immediately invokes onDone if the action already closed', function () {
    const action = new Action(identity)
    const callback = jest.fn()

    action.resolve(true)
    action.onDone(callback)

    expect(callback).toHaveBeenCalledWith(true)
  })

  it('actions are no longer open when they complete', function () {
    const action = new Action(identity)

    action.open(true)
    action.update(true)
    action.resolve(true)

    expect(action).not.toHaveStatus('loading')
    expect(action).toHaveStatus('done')
  })

  it('actions can not be resolved after rejected', function () {
    const repo = new Microcosm()
    const action = repo.append(identity)

    action.reject(false)
    action.resolve(true)

    expect(action).toHaveStatus('error')
    expect(action).not.toHaveStatus('done')
  })

  it('aliases the done type with resolve', function () {
    const action = new Action(identity)

    action.resolve()

    expect(action).toHaveStatus('resolve')
  })
})

describe('rejected state', function () {

  it('exposes a error type when rejected', function () {
    const action = new Action(identity)

    action.reject()

    expect(action).toHaveStatus('error')
  })

  it('triggers a error event when it is rejected', function () {
    const action = new Action(identity)
    const callback = jest.fn()

    action.once('reject', callback)
    action.reject(404)

    expect(callback).toHaveBeenCalledWith(404)
  })

  it('listens to failures', function () {
    const action = new Action(identity)
    const fn = jest.fn()

    action.onError(fn)
    action.reject(true)

    expect(fn).toHaveBeenCalledWith(true)
  })

  it('immediately invokes onError if the action already failed', function () {
    const action = new Action(identity)
    const fn = jest.fn()

    action.reject(true)
    action.onError(fn)

    expect(fn).toHaveBeenCalledWith(true)
  })

  it('does not trigger an error event if it is disposable', function () {
    const action = new Action(identity)
    const spy = jest.fn()

    action.on('error', spy)
    action.resolve()
    action.reject()

    expect(spy).not.toHaveBeenCalled()
  })

  it('aliases the done type with reject', function () {
    const action = new Action(identity)

    action.reject()

    expect(action).toHaveStatus('error')
  })
})

describe('disposed state', function () {

  it('actions are disposable when they resolve', function () {
    const action = new Action(identity)

    action.resolve(true)

    expect(action.disposable).toBe(true)
  })

  it('actions are disposable when they cancel', function () {
    const action = new Action(identity)

    action.cancel(true)

    expect(action.disposable).toBe(true)
  })

  it('actions are disposable when they fail', function () {
    const action = new Action(identity)

    action.reject(true)

    expect(action.disposable).toBe(true)
  })

  it('will not change states if already disposed', function () {
    const action = new Action(identity)

    action.cancel()
    action.resolve()

    expect(action.is('cancelled')).toBe(true)
    expect(action.is('done')).toBe(false)
  })

})

describe('cancelled state', function () {

  it('triggers a cancel event when it is cancelled', function () {
    const action = new Action(identity)
    const callback = jest.fn()

    action.once('cancel', callback)
    action.cancel()

    expect(callback).toHaveBeenCalled()
  })

  it('becomes disposable when cancelled', function () {
    const action = new Action(identity)

    action.cancel()

    expect(action.disposable).toBe(true)
  })

  it('exposes a cancelled type when cancelled', function () {
    const action = new Action(identity)

    action.cancel()

    expect(action).toHaveStatus('cancel')
  })

  it('onCancel is a one time binding', function () {
    const action = new Action(identity)
    const callback = jest.fn()

    action.onCancel(callback)

    action.cancel()
    action.cancel()

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('executes onCancel if the action is already cancelled', function () {
    const action = new Action(identity)
    const callback = jest.fn()

    action.cancel()
    action.onCancel(callback)

    expect(callback).toHaveBeenCalled()
  })

  it('aliases the cancelled type with cancel', function () {
    const action = new Action(identity)

    action.cancel()

    expect(action).toHaveStatus('cancel')
  })
})

describe('promise interop', function () {

  it('actions interop with promises', function () {
    const action = new Action(identity)

    action.resolve('Test')

    return action.then(result => expect(result).toBe('Test'))
  })

  it('actions interop with async/await', async function () {
    const action = new Action(identity)

    action.resolve('Test')

    const payload = await action

    expect(payload).toBe('Test')
  })

})

describe('teardown', function () {

  it('does not lose an onDone subscription when it resolves', function (done) {
    function test (action, method, payload) {
      return function (action) {
        Promise.resolve().then(() => action.resolve(true),
                               () => action.reject(false))
      }
    }

    const repo = new Microcosm()

    const action = repo.push(test)

    action.onDone(() => done())
  })

  it('does not lose an onError subscription when it fails', function (done) {
    function test (action, method, payload) {
      return Promise.reject()
    }

    const repo = new Microcosm()

    const action = repo.push(test)

    action.onError(() => done())
  })

  it('does not lose an onCancel subscription when it cancels', function (done) {
    function test (action, method, payload) {
      return function (action) {
        // intentionally blank
      }
    }

    const repo = new Microcosm()

    const action = repo.push(test)

    action.onCancel(() => done())

    action.cancel()
  })

})

describe('::toggle', function() {

  it('it will not dispatch an action disabled at the head', function () {
    const repo = new Microcosm({ maxHistory: Infinity })

    repo.addDomain('count', {
      getInitialState () {
        return 0
      },
      register () {
        return {
          action : (a, b) => a + b
        }
      }
    })

    repo.push('action', 2)
    repo.push('action', 1).toggle()

    expect(repo.state.count).toEqual(2)
  })

  it('it will not dispatch an action disabled in the middle', function () {
    const repo = new Microcosm({ maxHistory: Infinity })

    repo.addDomain('count', {
      getInitialState () {
        return 0
      },
      register () {
        return {
          action : (a, b) => a + b
        }
      }
    })

    repo.push('action', 2)
    let second = repo.push('action', 1)
    repo.push('action', 2)

    second.toggle()

    expect(repo.state.count).toEqual(4)
  })

})
