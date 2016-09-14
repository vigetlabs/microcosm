import test from 'ava'
import Action from '../src/action'

const identity = n => n

test('accommodates string actions', t => {
  const action = new Action('test').close()

  t.is(action.type, 'test')
})

test('initially returns no type', t => {
  const action = new Action(identity)

  t.is(action.type, null)
})

test('returns no type when disabled', t => {
  const action = new Action(identity)

  action.toggle()

  t.is(action.type, null)
})

test('preserves other states when disabled', t => {
  const action = new Action(identity)

  action.close()
  action.toggle()

  t.is(action.is('done'), true)
})

test('exposes a cancelled type when cancelled', t => {
  const action = new Action(identity)

  action.cancel()

  t.is(action.type, identity.cancelled)
})

test('becomes disposable when cancelled', t => {
  const action = new Action(identity)

  action.cancel()

  t.is(action.is('disposable'), true)
})

test('exposes a failed type when rejected', t => {
  const action = new Action(identity)

  action.reject()

  t.is(action.type, identity.failed)
})

test('exposes an open type when opened', t => {
  const action = new Action(identity)

  action.open()

  t.is(action.type, identity.open)
})

test('exposes a loading type when in progress', t => {
  const action = new Action(identity)

  action.send()

  t.is(action.type, identity.loading)
})

test('exposes a done type when completed', t => {
  const action = new Action(identity)

  action.close()

  t.is(action.type, identity.done)
})

test('listens to progress updates', t => {
  const action = new Action(identity)

  t.plan(1)

  action.onUpdate(payload => {
    t.is(payload, true)
  })

  action.send(true)
})

test('listens to failures', t => {
  const action = new Action(identity)

  t.plan(1)

  action.onError(payload => {
    t.is(payload, true)
  })

  action.reject(true)
})

test('immediately invokes onError if the action already failed', t => {
  const action = new Action(identity)

  t.plan(1)

  action.reject(true)

  action.onError(payload => {
    t.is(payload, true)
  })
})

test('listens to completion', t => {
  const action = new Action(identity)

  t.plan(1)

  action.onDone(payload => {
    t.is(payload, true)
  })

  action.close(true)
})

test('immediately invokes onDone if the action already closed', t => {
  const action = new Action(identity)

  t.plan(1)

  action.close(true)

  action.onDone(payload => {
    t.is(payload, true)
  })
})

test('immediately invokes onError if the action already failed', t => {
  const action = new Action(identity)

  t.plan(1)

  action.reject(true)

  action.onError(payload => {
    t.is(payload, true)
  })
})

test('triggers an open event when it opens', t => {
  const action = new Action(identity)

  t.plan(1)

  action.once('open', function (body) {
    t.is(body, 3)
  })

  action.open(3)
})

test('triggers an update event when it sends', t => {
  const action = new Action(identity)

  t.plan(1)

  action.once('update', function (body) {
    t.is(body, 3)
  })

  action.send(3)
})

test('triggers a done event when it closes', t => {
  const action = new Action(identity)

  t.plan(1)

  action.once('done', function (body) {
    t.is(body, 3)
  })

  action.close(3)
})

test('triggers a error event when it is rejected', t => {
  const action = new Action(identity)

  t.plan(1)

  action.once('error', function (reason) {
    t.is(reason, 404)
  })

  action.reject(404)
})

test('triggers a cancel event when it is cancelled', t => {
  const action = new Action(identity)

  t.plan(1)

  action.once('cancel', () => t.pass())
  action.cancel()
})

test('triggers a change event when it is toggled', t => {
  const action = new Action(identity)

  t.plan(1)

  action.once('change', () => t.pass())

  action.toggle()
})

test('actions are unset when first created', t => {
  const action = new Action(identity)

  t.pass(action.is('unset'))
})

test('actions are no longer unset when opened', t => {
  const action = new Action(identity)

  action.open(true)

  t.is(action.is('unset'), false)
  t.is(action.is('open'), true)
})

test('actions are no longer open when in progress', t => {
  const action = new Action(identity)

  action.open(true)
  action.send(true)

  t.is(action.is('open'), false)
  t.is(action.is('loading'), true)
})

test('actions are no loading open when they complete', t => {
  const action = new Action(identity)

  action.open(true)
  action.send(true)
  action.close(true)

  t.is(action.is('loading'), false)
  t.is(action.is('done'), true)
})

test('actions are disposable when they close', t => {
  const action = new Action(identity)

  action.close(true)

  t.is(action.is('disposable'), true)
})

test('actions are disposable when they fail', t => {
  const action = new Action(identity)

  action.reject(true)

  t.is(action.is('disposable'), true)
})

test('actions are disposable when they are cancelled', t => {
  const action = new Action(identity)

  action.cancel(true)

  t.is(action.is('disposable'), true)
})

test('actions interop with promises', t => {
  const action = new Action(identity)

  action.close('Test')

  return action.then(result => t.is(result, 'Test'))
})

test('cancel can be subscribed to', t => {
  const action = new Action(identity)

  t.plan(1)

  action.onCancel(() => t.pass())

  action.cancel()
})

test('onCancel is a one time binding', t => {
  const action = new Action(identity)

  t.plan(1)

  action.onCancel(() => t.pass())

  action.cancel()
  action.cancel()
})
