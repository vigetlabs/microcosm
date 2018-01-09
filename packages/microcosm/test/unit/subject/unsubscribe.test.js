import Microcosm, { Observable } from 'microcosm'

let hang = () => new Promise(() => {})

describe('Subject unsubscribed state', function() {
  it('calls the clean up function of observables when it is unsubscribed', function() {
    let repo = new Microcosm()
    let cleanup = jest.fn()
    let action = repo.push(() => new Observable(observer => cleanup))

    action.unsubscribe()

    expect(cleanup).toHaveBeenCalled()
  })

  it('becomes closed when unsubscribed', function() {
    const repo = new Microcosm()
    const action = repo.push(hang)

    action.unsubscribe()

    expect(action.closed).toBe(true)
  })

  it('exposes a unsubscribed type when unsubscribed', function() {
    const repo = new Microcosm()
    const action = repo.push(hang)

    action.unsubscribe()

    expect(action.status).toBe('unsubscribe')
  })

  it('unsubscribe is a one time binding', function() {
    const repo = new Microcosm()
    const action = repo.push(hang)
    const unsubscribe = jest.fn()

    action.subscribe({ unsubscribe })

    action.unsubscribe()
    action.unsubscribe()

    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })

  it('executes unsubscribe if the action is already unsubscribed', function() {
    const repo = new Microcosm()
    const action = repo.push(hang)
    const unsubscribe = jest.fn()

    action.unsubscribe()
    action.subscribe({ unsubscribe })

    expect(unsubscribe).toHaveBeenCalled()
  })
})
