import Microcosm from '../../src/microcosm'

test('completes when a promise resolves', function (done) {
  const repo = new Microcosm()
  const action = repo.push(n => Promise.resolve(n))

  action.onDone(() => done())
})

test('rejects when a promise fails', function (done) {
  const repo = new Microcosm()
  const action = repo.push(n => Promise.reject(n))

  action.onError(() => done())
})

test('rejects when a promise throws an error', function (done) {
  const repo = new Microcosm()
  const action = repo.push(n => new Promise(function (resolve, reject) {
    throw 'This error is intentional'
  }))

  action.onError(() => done())
})
