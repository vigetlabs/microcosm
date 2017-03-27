import Microcosm from '../../../src/microcosm'

describe('Promise middleware', function () {

  it('completes when a promise resolves', function (done) {
    let repo = new Microcosm()
    let task = repo.push(n => Promise.resolve(n))

    task.onDone(() => done())
  })

  it('rejects when a promise fails', function (done) {
    let repo = new Microcosm()
    let task = repo.push(n => Promise.reject(n))

    task.onError(() => done())
  })

  it('rejects when a promise throws an error', function (done) {
    let repo = new Microcosm()
    let task = repo.push(n => new Promise(function (resolve, reject) {
      throw 'This error is intentional'
    }))

    task.onError(() => done())
  })

})
