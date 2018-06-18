import { Microcosm, patch } from 'microcosm'

describe('Efficiency', function() {
  it('actions are not dispatched twice', () => {
    const parent = new Microcosm()
    const handler = jest.fn()
    const action = n => n

    parent.addDomain('one', {
      register() {
        return {
          [action]: handler
        }
      }
    })

    parent.push(patch, {})
    parent.push(action)
    parent.push(patch, {})

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('actions are only dispatched once with infinite history', () => {
    const parent = new Microcosm({ debug: true })
    const handler = jest.fn()
    const action = n => n

    parent.addDomain('one', {
      register() {
        return {
          [action]: handler
        }
      }
    })

    parent.push(patch, {})
    parent.push(action)
    parent.push(patch, {})

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('actions are only dispatched once with fixed size history', () => {
    const parent = new Microcosm()
    const handler = jest.fn()
    const action = n => n

    parent.addDomain('one', {
      register() {
        return {
          [action]: handler
        }
      }
    })

    parent.push(patch, {})
    parent.push(action)
    parent.push(patch, {})

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('actions only dispatch duplicatively to address races', () => {
    const repo = new Microcosm()
    const handler = jest.fn()
    const action = () => () => {}

    repo.addDomain('one', {
      register() {
        return {
          [action]: handler
        }
      }
    })

    const one = repo.push(action)
    const two = repo.push(action)

    two.complete(1)
    one.complete(2)

    expect(handler).toHaveBeenCalledTimes(3)
  })
})
