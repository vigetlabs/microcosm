import Microcosm from '../../../src/microcosm'

describe('Promise middleware', function () {

  it('completes when a promise resolves', function (done) {
    const repo = new Microcosm()
    const action = repo.push(n => Promise.resolve(n))

    action.onDone(() => done())
  })

  it('rejects when a promise fails', function (done) {
    const repo = new Microcosm()
    const action = repo.push(n => Promise.reject(n))

    action.onError(() => done())
  })

  it('rejects when a promise throws an error', function (done) {
    const repo = new Microcosm()
    const action = repo.push(n => new Promise(function (resolve, reject) {
      throw 'This error is intentional'
    }))

    action.onError(() => done())
  })

})
