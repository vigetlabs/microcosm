import Action from '../../src/action'

test('completes when a promise resolves', function (done) {
  const action = new Action(n => Promise.resolve(n))

  action.onDone(() => done())

  action.execute(['test'])
})

test('rejects when a promise fails', function (done) {
  const action = new Action(n => Promise.reject(n))

  action.onError(() => done())

  action.execute(['test'])
})

test('rejects when a promise throws an error', function (done) {
  const action = new Action(n => new Promise(function (resolve, reject) {
    throw 'This error is intentional'
  }))

  action.onError(() => done())

  action.execute(['test'])
})
