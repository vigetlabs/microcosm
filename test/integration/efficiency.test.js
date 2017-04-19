import Microcosm from '../../src/microcosm'

describe('Efficiency', function () {
  it('actions are not dispatched twice with 0 history', () => {
    const parent = new Microcosm({ maxHistory: 0 })
    const handler = jest.fn()
    const action = n => n

    parent.addDomain('one', {
      register () {
        return {
          [action]: handler,
        }
      },
    })

    parent.patch()
    parent.push(action)
    parent.patch()

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('actions are only dispatched once with infinite history', () => {
    const parent = new Microcosm({ maxHistory: Infinity })
    const handler = jest.fn()
    const action = n => n

    parent.addDomain('one', {
      register () {
        return {
          [action]: handler,
        }
      },
    })

    parent.patch()
    parent.push(action)
    parent.patch()

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('actions are only dispatched once with fixed size history', () => {
    const parent = new Microcosm({ maxHistory: 1 })
    const handler = jest.fn()
    const action = n => n

    parent.addDomain('one', {
      register () {
        return {
          [action]: handler,
        }
      },
    })

    parent.patch()
    parent.push(action)
    parent.patch()

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('actions only dispatch duplicatively to address races', () => {
    const repo = new Microcosm({ maxHistory: 1 })
    const handler = jest.fn()
    const action = n => n

    repo.addDomain('one', {
      register () {
        return {
          [action]: handler,
        }
      },
    })

    const one = repo.append(action)
    const two = repo.append(action)

    two.resolve()
    one.resolve()

    expect(handler).toHaveBeenCalledTimes(3)
  })

  it('does not dispatch a change event if nothing changes on the first reconciliation', () => {
    const repo = new Microcosm()

    repo.on('change', function () {
      throw new Error('Change event should not have fired')
    })

    repo.push('test')
  })
})
