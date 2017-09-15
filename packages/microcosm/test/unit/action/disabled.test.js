import Microcosm from 'microcosm'

const identity = n => n

describe('Action disabled state', function() {
  it('preserves other states when disabled', function() {
    const repo = new Microcosm()
    const action = repo.append(identity)

    action.resolve()
    action.toggle()

    expect(action).toHaveStatus('done')
  })

  it('is toggleable', function() {
    const repo = new Microcosm()
    const action = repo.append(identity)

    action.resolve()
    expect(action.disabled).toBe(false)

    action.toggle()
    expect(action.disabled).toBe(true)
  })

  it('can toggle history without triggering a reconciliation', function() {
    const repo = new Microcosm()
    const action = repo.append(identity)
    const handler = jest.fn()

    action.on('change', handler)

    action.toggle('silently')

    expect(handler).not.toHaveBeenCalled()
  })
})
