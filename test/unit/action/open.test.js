import Action from '../../../src/action'

const identity = n => n

describe('Action open state', function() {
  it('exposes an open type when opened', function() {
    const action = new Action(identity)

    action.open()

    expect(action).toHaveStatus('open')
  })

  it('triggers an open event when it opens', function() {
    const action = new Action(identity)
    const callback = jest.fn()

    action.once('open', callback)
    action.open(3)

    expect(callback).toHaveBeenCalledWith(3)
  })

  it('actions are no longer disabled when opened', function() {
    const action = new Action(identity)

    action.open(true)

    expect(action.disabled).toBe(false)
    expect(action).toHaveStatus('open')
  })

  it('does not trigger an open event if it is complete', function() {
    const action = new Action(identity)
    const spy = jest.fn()
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})

    action.on('open', spy)
    action.resolve()
    action.open()

    expect(warn).toHaveBeenCalledWith(
      'Action "identity" is already in the resolve state. Calling open() will not change it.'
    )

    expect(spy).not.toHaveBeenCalled()
  })
})
