import Microcosm, { patch } from 'microcosm'

describe('Microcosm::fork', function() {
  it('forks can not manage state owned by parents', () => {
    const parent = new Microcosm()
    const child = parent.fork()

    parent.addDomain('counter', {})

    expect(function() {
      child.addDomain('counter', {})
    }).toThrow(
      'Can not add domain for "counter". This state is already managed.'
    )
  })

  it('recieve upstream state updates when they push actions', () => {
    const parent = new Microcosm({ maxHistory: Infinity })
    const child = parent.fork()

    const add = n => n

    parent.addDomain('counter', {
      getInitialState() {
        return 0
      },
      register() {
        return {
          [add]: (a, b) => a + b
        }
      }
    })

    child.push(add, 2)
    child.push(add, 4)

    expect(parent).toHaveState('counter', 6)
    expect(child).toHaveState('counter', 6)
  })

  it('forks handle cases where they are lost during a reconcilation', function() {
    const parent = new Microcosm()
    const child = parent.fork()

    parent.subscribe(() => child.teardown())
    parent.push(patch, { test: true })
  })
})
