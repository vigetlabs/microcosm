import Action from '../src/action'
import Microcosm from '../src/microcosm'

const identity = n => n

test('accommodates string actions', function () {
  const action = new Action('test').resolve()

  expect(action.type).toBe('test')
})

test('initially returns no type', function () {
  const action = new Action(identity)

  expect(action.type).toBe(null)
})

test('is toggleable', function () {
  const action = new Action(identity)

  action.open()

  action.toggle()
  expect(action.is('disabled')).toBeTruthy()

  action.toggle()
  expect(action.is('disabled')).toBeFalsy()
})

test('returns no type when disabled', function () {
  const action = new Action(identity)

  action.toggle()

  expect(action.type).toBe(null)
})

test('preserves other states when disabled', function () {
  const action = new Action(identity)

  action.resolve()
  action.toggle()

  expect(action.is('done')).toBe(true)
})

test('exposes a cancelled type when cancelled', function () {
  const action = new Action(identity)

  action.cancel()

  expect(action.type).toBe(identity.cancelled)
})

test('becomes disposable when cancelled', function () {
  const action = new Action(identity)

  action.cancel()

  expect(action.is('disposable')).toBe(true)
})

test('exposes a error type when rejected', function () {
  const action = new Action(identity)

  action.reject()

  expect(action.type).toBe(identity.error)
})

test('exposes an open type when opened', function () {
  const action = new Action(identity)

  action.open()

  expect(action.type).toBe(identity.open)
})

test('exposes a loading type when in progress', function () {
  const action = new Action(identity)

  action.send()

  expect(action.type).toBe(identity.loading)
})

test('exposes a done type when completed', function () {
  const action = new Action(identity)

  action.resolve()

  expect(action.type).toBe(identity.done)
})

test('listens to progress updates', function () {
  const action = new Action(identity)
  const fn = jest.fn()

  action.onUpdate(fn)
  action.send(true)

  expect(fn).toHaveBeenCalledWith(true)
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

test('listens to completion', function () {
  const action = new Action(identity)

  action.onDone(payload => {
    expect(payload).toBe(true)
  })

  return action.resolve(true)
})

test('immediately invokes onDone if the action already closed', (done) => {
  const action = new Action(identity)

  action.resolve(true)

  action.onDone(payload => {
    expect(payload).toBe(true)
    done()
  })
})

test('immediately invokes onError if the action already failed', (done) => {
  const action = new Action(identity)

  action.reject(true)

  action.onError(payload => {
    expect(payload).toBe(true)
    done()
  })
})

test('triggers an open event when it opens', (done) => {
  const action = new Action(identity)

  action.once('open', function (body) {
    expect(body).toBe(3)
    done()
  })

  action.open(3)
})

test('triggers an update event when it sends', (done) => {
  const action = new Action(identity)

  action.once('update', function (body) {
    expect(body).toBe(3)
    done()
  })

  action.send(3)
})

test('triggers a done event when it resolves', (done) => {
  const action = new Action(identity)

  action.once('done', function (body) {
    expect(body).toBe(3)
    done()
  })

  action.resolve(3)
})

test('triggers a error event when it is rejected', (done) => {
  const action = new Action(identity)

  action.once('error', function (reason) {
    expect(reason).toBe(404)
    done()
  })

  action.reject(404)
})

test('triggers a cancel event when it is cancelled', (done) => {
  const action = new Action(identity)

  action.once('cancel', () => done())
  action.cancel()
})

test('actions are disabled when first created', function () {
  const action = new Action(identity)

  expect(action.is('disabled')).toBe(true)
})

test('actions are no longer disabled when opened', function () {
  const action = new Action(identity)

  action.open(true)

  expect(action.is('disabled')).toBe(false)
  expect(action.is('open')).toBe(true)
})

test('actions are no longer open when in progress', function () {
  const action = new Action(identity)

  action.open(true)
  action.send(true)

  expect(action.is('open')).toBe(false)
  expect(action.is('loading')).toBe(true)
})

test('actions are no loading open when they complete', function () {
  const action = new Action(identity)

  action.open(true)
  action.send(true)
  action.resolve(true)

  expect(action.is('loading')).toBe(false)
  expect(action.is('done')).toBe(true)
})

test('actions are disposable when they resolve', function () {
  const action = new Action(identity)

  action.resolve(true)

  expect(action.is('disposable')).toBe(true)
})

test('actions are disposable when they fail', function () {
  const action = new Action(identity)

  action.reject(true)

  expect(action.is('disposable')).toBe(true)
})

test('actions are disposable when they are cancelled', function () {
  const action = new Action(identity)

  action.cancel(true)

  expect(action.is('disposable')).toBe(true)
})

test('actions interop with promises', function () {
  const action = new Action(identity)

  action.resolve('Test')

  return action.then(result => expect(result).toBe('Test'))
})

test('cancel can be subscribed to', (done) => {
  const action = new Action(identity)

  action.onCancel(() => done())

  action.cancel()
})

test('onCancel is a one time binding', (done) => {
  const action = new Action(identity)

  action.onCancel(() => done())

  action.cancel()
  action.cancel()
})

test('executes onCancel if the action is already cancelled', (done) => {
  const action = new Action(identity)

  action.cancel()

  action.on = function() {
    throw new Error('Should not have subscribed cancel. Action already cancelled.')
  }

  action.onCancel(() => done())
})

test('actions can be tested in reverse', function () {
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
