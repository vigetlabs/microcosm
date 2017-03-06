import Microcosm from '../../../src/microcosm'

describe('Microcosm::fork', function () {

  it('forks do not own state of parents', () => {
    const parent = new Microcosm()
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

    child.addDomain('counter', {
      register() {
        return {
          [add]: (a, b)  => a * 2
        }
      }
    })

    parent.push(add, 2)

    expect(parent.state.counter).toEqual(2)
    expect(child.state.counter).toEqual(4)
  })

  it('forks continue to get updates from their parents when there is no archive', () => {
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

    child.addDomain('counter', {
      register() {
        return {
          [add](a) {
            return a * 2
          }
        }
      }
    })

    child.push(add, 2)
    child.push(add, 4)

    expect(parent.state.counter).toEqual(6)

    // If this is 24, then multiplcation applied twice on 6,
    // rather than multiply 6 by 2
    expect(child.state.counter).toEqual(12)
  })

  it('forks handle async', () => {
    const parent = new Microcosm()
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

    child.addDomain('counter', {
      register() {
        return {
          [add](a) {
            return a * 2
          }
        }
      }
    })

    child.push(add, 2)
    child.push(add, 4)

    expect(parent.state.counter).toEqual(6)

    // If this is 24, then multiplcation applied twice on 6,
    // rather than multiply 6 by 2
    expect(child.state.counter).toEqual(12)
  })

  it('forks handle cases where they are lostlost during a reconcilation', function () {
    const parent = new Microcosm()
    const child = parent.fork()

    parent.on('change', function() {
      child.teardown()
    })

    parent.patch({ test: true })
  })

})
