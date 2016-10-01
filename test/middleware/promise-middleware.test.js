import test   from 'ava'
import Action from '../../src/action'

test.cb('completes when a promise resolves', t => {
  const action = new Action(n => Promise.resolve(n))

  action.onDone(() => t.end())

  action.execute(['test'])
})

test.cb('rejects when a promise fails', t => {
  const action = new Action(n => Promise.reject(n))

  action.onError(() => t.end())

  action.execute(['test'])
})

test.cb('rejects when a promise throws an error', t => {
  const action = new Action(n => new Promise(function (resolve, reject) {
    throw 'This error is intentional'
  }))

  action.onError(() => t.end())

  action.execute(['test'])
})
