import Action from '../../../src/action'
import Microcosm from '../../../src/microcosm'

const identity = n => n

describe('Action done state', function() {
  it('exposes a done type when completed', function() {
    const action = new Action(identity)

    action.resolve()

    expect(action).toHaveStatus('done')
  })

  it('triggers a done event when it resolves', function() {
    const action = new Action(identity)
    const callback = jest.fn()

    action.once('resolve', callback)
    action.resolve(3)

    expect(callback).toHaveBeenCalledWith(3)
  })

  it('immediately invokes onDone if the action already closed', function() {
    const action = new Action(identity)
    const callback = jest.fn()

    action.resolve(true)
    action.onDone(callback)

    expect(callback).toHaveBeenCalledWith(true)
  })

  it('actions are no longer open when they complete', function() {
    const action = new Action(identity)

    action.open(true)
    action.update(true)
    action.resolve(true)

    expect(action).not.toHaveStatus('loading')
    expect(action).toHaveStatus('done')
  })

  it('actions can not be resolved after rejected', function() {
    const repo = new Microcosm()
    const action = repo.append(identity)
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    action.reject(false)
    action.resolve()

    expect(spy).toHaveBeenCalledWith(
      'Action "identity" is already in the reject state. Calling resolve() will not change it.'
    )

    expect(action).toHaveStatus('error')
    expect(action).not.toHaveStatus('done')

    spy.mockRestore()
  })

  it('aliases the done type with resolve', function() {
    const action = new Action(identity)

    action.resolve()

    expect(action).toHaveStatus('resolve')
  })
})
