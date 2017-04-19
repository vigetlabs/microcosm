import Microcosm from '../../../src/microcosm'

describe('Promise middleware', function () {
  it('opens with the first argument of params', function () {
    const repo = new Microcosm()
    const action = repo.push(n => Promise.resolve(n), true)

    expect(action).toHaveStatus('open')
    expect(action.payload).toEqual(true)
  })

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
    const action = repo.push(
      n =>
        new Promise(function (resolve, reject) {
          throw 'This error is intentional'
        }),
    )

    action.onError(() => done())
  })

  it('handles successful chains', function (done) {
    const repo = new Microcosm()
    const action = repo.push(n => Promise.resolve().then(() => n))

    action.onDone(() => done())
  })

  it('handles failed chains', function (done) {
    const repo = new Microcosm()
    const action = repo.push(n => {
      return Promise.resolve().then(() => Promise.reject('error'))
    })

    action.onError(() => done())
  })

  it('handles failed chains that raise errors', function (done) {
    const repo = new Microcosm()
    const action = repo.push(n => {
      return Promise.resolve().then(() => {
        throw new Error('error')
      })
    })

    action.onError(() => done())
  })
})
