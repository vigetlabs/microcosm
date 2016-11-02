import Action from '../src/action'
import Microcosm from '../src/microcosm'

const identity = n => n

test('accommodates string actions', function () {
  const action = new Action('test').resolve()

  expect(action.type).toBe('test')
})

test('actions can be tested externally', function () {
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

test('handles listeners with no callback', function () {
  const action = new Action(n => n)

  action.onDone()
  action.onError()
  action.onCancel()
  action.onUpdate()
})

test('throws if given an object', function () {
  expect(() => new Action({ id: 'foo' })).toThrow()
})

test('does not throw if given null', function () {
  expect(() => new Action(null)).toThrow()
})

describe('open state', function () {

  test('exposes an open type when opened', function () {
    const action = new Action(identity)

    action.open()

    expect(action.type).toBe(identity.open)
  })

  test('triggers an open event when it opens', function () {
    const action = new Action(identity)
    const callback = jest.fn()

    action.once('open', callback)
    action.open(3)

    expect(callback).toHaveBeenCalledWith(3)
  })

  test('actions are no longer disabled when opened', function () {
    const action = new Action(identity)

    action.open(true)

    expect(action.is('disabled')).toBe(false)
    expect(action.is('open')).toBe(true)
  })

})

describe('progress state', function () {

  test('exposes a loading type when in progress', function () {
    const action = new Action(identity)

    action.send()

    expect(action.type).toBe(identity.loading)
  })

  test('listens to progress updates', function () {
    const action = new Action(identity)
    const fn = jest.fn()

    action.onUpdate(fn)
    action.send(true)

    expect(fn).toHaveBeenCalledWith(true)
  })

  test('does not trigger onUpdate if in progress', function () {
    const action = new Action(identity)
    const fn = jest.fn()

    action.send(true)
    action.onUpdate(fn)

    expect(fn).not.toHaveBeenCalled()
  })

  test('actions are no longer open when in progress', function () {
    const action = new Action(identity)

    action.open(true)
    action.send(true)

    expect(action.is('open')).toBe(false)
    expect(action.is('loading')).toBe(true)
  })

  test('triggers an update event when it sends', function () {
    const action = new Action(identity)
    const callback = jest.fn()

    action.once('update', callback)
    action.send(3)

    expect(callback).toHaveBeenCalledWith(3)
  })

})

describe('disabled state', function () {

  test('actions are disabled when first created', function () {
    const action = new Action(identity)

    expect(action.is('disabled')).toBe(true)
  })

  test('actions return no type when disabled', function () {
    const action = new Action(identity)

    action.resolve()
    action.toggle()

    expect(action.type).toBe(null)
  })

  test('preserves other states when disabled', function () {
    const action = new Action(identity)

    action.resolve()
    action.toggle()

    expect(action.is('done')).toBe(true)
  })

  test('is toggleable', function () {
    const action = new Action(identity)

    action.resolve()
    expect(action.is('disabled')).toBe(false)

    action.toggle()
    expect(action.is('disabled')).toBe(true)
  })

  test('returns no type when disabled', function () {
    const action = new Action(identity)

    action.toggle()

    expect(action.type).toBe(null)
  })

})

describe('resolved state', function () {

  test('exposes a done type when completed', function () {
    const action = new Action(identity)

    action.resolve()

    expect(action.type).toBe(identity.done)
  })

  test('triggers a done event when it resolves', function () {
    const action = new Action(identity)
    const callback = jest.fn()

    action.once('done', callback)
    action.resolve(3)

    expect(callback).toHaveBeenCalledWith(3)
  })

  test('immediately invokes onDone if the action already closed', function () {
    const action = new Action(identity)
    const callback = jest.fn()

    action.resolve(true)
    action.onDone(callback)

    expect(callback).toHaveBeenCalledWith(true)
  })

  test('actions are no longer open when they complete', function () {
    const action = new Action(identity)

    action.open(true)
    action.send(true)
    action.resolve(true)

    expect(action.is('loading')).toBe(false)
    expect(action.is('done')).toBe(true)
  })

  test('actions can not be resolved after rejected', function () {
    const action = new Action(identity)

    action.reject()
    action.resolve()

    expect(action.is('error')).toBe(true)
    expect(action.is('done')).toBe(false)
  })

})

describe('rejected state', function () {

  test('exposes a error type when rejected', function () {
    const action = new Action(identity)

    action.reject()

    expect(action.type).toBe(identity.error)
  })

  test('triggers a error event when it is rejected', function () {
    const action = new Action(identity)
    const callback = jest.fn()

    action.once('error', callback)
    action.reject(404)

    expect(callback).toHaveBeenCalledWith(404)
  })

  test('listens to failures', function () {
    const action = new Action(identity)
    const fn = jest.fn()

    action.onError(fn)
    action.reject(true)

    expect(fn).toHaveBeenCalledWith(true)
  })

  test('immediately invokes onError if the action already failed', function () {
    const action = new Action(identity)
    const fn = jest.fn()

    action.reject(true)
    action.onError(fn)

    expect(fn).toHaveBeenCalledWith(true)
  })

})

describe('disposed state', function () {

  test('actions are disposable when they resolve', function () {
    const action = new Action(identity)

    action.resolve(true)

    expect(action.is('disposable')).toBe(true)
  })

  test('actions are disposable when they cancel', function () {
    const action = new Action(identity)

    action.cancel(true)

    expect(action.is('disposable')).toBe(true)
  })

  test('actions are disposable when they fail', function () {
    const action = new Action(identity)

    action.reject(true)

    expect(action.is('disposable')).toBe(true)
  })

  test('will not change states if already disposed', function () {
    const action = new Action(identity)

    action.cancel()
    action.resolve()

    expect(action.is('cancelled')).toBe(true)
    expect(action.is('resolved')).toBe(false)
  })

})

describe('cancelled state', function () {

  test('triggers a cancel event when it is cancelled', function () {
    const action = new Action(identity)
    const callback = jest.fn()

    action.once('cancel', callback)
    action.cancel()

    expect(callback).toHaveBeenCalled()
  })

  test('becomes disposable when cancelled', function () {
    const action = new Action(identity)

    action.cancel()

    expect(action.is('disposable')).toBe(true)
  })

  test('exposes a cancelled type when cancelled', function () {
    const action = new Action(identity)

    action.cancel()

    expect(action.type).toBe(identity.cancelled)
  })

  test('onCancel is a one time binding', function () {
    const action = new Action(identity)
    const callback = jest.fn()

    action.onCancel(callback)

    action.cancel()
    action.cancel()

    expect(callback).toHaveBeenCalledTimes(1)
  })

  test('executes onCancel if the action is already cancelled', function () {
    const action = new Action(identity)
    const callback = jest.fn()

    action.cancel()
    action.onCancel(callback)

    expect(callback).toHaveBeenCalled()
  })

})

describe('promise interop', function () {

  test('actions interop with promises', function () {
    const action = new Action(identity)

    action.resolve('Test')

    return action.then(result => expect(result).toBe('Test'))
  })

  test('actions interop with async/await', async function () {
    const action = new Action(identity)

    action.resolve('Test')

    const payload = await action

    expect(payload).toBe('Test')
  })

})

describe('teardown', function () {

  test('does not lose an onDone subscription when it resolves', function (done) {
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

  test('does not lose an onError subscription when it fails', function (done) {
    function test (action, method, payload) {
      return function (action) {
        Promise.reject().then(() => action.resolve(true),
                               () => action.reject(false))
      }
    }

    const repo = new Microcosm()

    const action = repo.push(test)

    action.onError(() => done())
  })

  test('does not lose an onCancel subscription when it cancels', function (done) {
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
