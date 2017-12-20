import Microcosm from 'microcosm'

describe('Subject start state', function() {
  it('exposes an start type when started', function() {
    const repo = new Microcosm()
    const action = repo.push(() => new Promise(() => {}))

    expect(action.status).toBe('start')
  })

  it('triggers an start event when it starts', function() {
    const repo = new Microcosm()
    const action = repo.push(n => n, 3)
    const start = jest.fn()

    action.subscribe({ start })

    expect(start).toHaveBeenCalled()
  })
})
