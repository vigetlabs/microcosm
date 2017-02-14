import Microcosm from '../src/microcosm'

test('forks inherit state', function () {
  const parent = new Microcosm()
  const child = parent.fork()

  parent.addDomain('foo', {})

  parent.reset({ foo: 'bar' })

  expect(child.state.foo).toEqual('bar')
})

test('pushing actions on the child float up to the parent', function () {
  const parent = new Microcosm()
  const child = parent.fork()

  const setColor = n => n
  const setShape = n => n

  parent.addDomain('color', {
    getInitialState() {
      return 'red'
    },
    register() {
      return { [setColor]: (a, b) => b }
    }
  })

  child.addDomain('shape', {
    getInitialState() {
      return 'triangle'
    },
    register() {
      return { [setShape]: (a, b) => b }
    }
  })

  expect(parent.state.color).toEqual('red')
  expect(parent.state.shape).toEqual(undefined)
  expect(child.state.color).toEqual('red')
  expect(child.state.shape).toEqual('triangle')

  child.push(setShape, 'square')
  child.push(setColor, 'blue')

  expect(parent.state.color).toEqual('blue')
  expect(parent.state.shape).toEqual(undefined)
  expect(child.state.color).toEqual('blue')
  expect(child.state.shape).toEqual('square')
})

test('pushing actions on the parent sink down to children', function () {
  const parent = new Microcosm()
  const child = parent.fork()

  const setColor = n => n
  const setShape = n => n

  parent.addDomain('color', {
    getInitialState() {
      return 'red'
    },
    register() {
      return { [setColor]: (a, b) => b }
    }
  })

  child.addDomain('shape', {
    getInitialState() {
      return 'triangle'
    },
    register() {
      return { [setShape]: (a, b) => b }
    }
  })

  expect(parent.state.color).toEqual('red')
  expect(parent.state.shape).toEqual(undefined)
  expect(child.state.color).toEqual('red')
  expect(child.state.shape).toEqual('triangle')

  parent.push(setShape, 'square')
  parent.push(setColor, 'blue')

  expect(parent.state.color).toEqual('blue')
  expect(parent.state.shape).toEqual(undefined)
  expect(child.state.color).toEqual('blue')
  expect(child.state.shape).toEqual('square')
})

test('forks from the same parent propagate', function () {
  const parent = new Microcosm()
  const left = parent.fork()
  const right = parent.fork()

  const setColor = n => n

  parent.addDomain('color', {
    getInitialState() {
      return 'red'
    },
    register() {
      return { [setColor]: (a, b) => b }
    }
  })

  parent.push(setColor, 'blue')

  expect(parent.state.color).toEqual('blue')
  expect(right.state.color).toEqual('blue')
  expect(left.state.color).toEqual('blue')
})

test('tearing down eliminates parent subscriptions', function () {
  const parent = new Microcosm()
  const child = parent.fork()

  parent.addDomain('color', {})

  parent.patch({ color: 'red' })

  child.on('change', function() {
    throw new Error('Should not have changed')
  })

  child.teardown()

  parent.patch({ color: 'blue' })

  expect(parent.state.color).toEqual('blue')
  expect(child.state.color).toEqual('red')
})

test('it deeply inherits state', function () {
  const tree = new Microcosm({ maxHistory: Infinity })

  tree.addDomain('color', {})

  tree.patch({ color: 'red' })

  const branch = tree.fork()
  const leaf = branch.fork()

  expect(branch.state.color).toEqual('red')

  expect(leaf.state.color).toEqual('red')
})

test('forks do not own state of parents', () => {
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

test('forks continue to get updates from their parents when there is no archive', () => {
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

test('forks handle async', () => {
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

describe('patch', function () {
  test('forks properly archive after a patch', () => {
    const parent = new Microcosm({ maxHistory: 0 })

    parent.addDomain('one', {
      register () {
        return {
          getInitialState : () => false,
          one : (a, b) => b
        }
      }
    })

    parent.addDomain('two', {
      register () {
        return {
          getInitialState : () => false,
          two : (a, b) => b
        }
      }
    })

    parent.patch({ one: false, two: false })

    const child = parent.fork()

    const one = parent.append('one')
    const two = parent.append('two')

    two.resolve(true)
    one.resolve(true)

    expect(child.state.one).toBe(true)
    expect(child.state.two).toBe(true)
  })

  test('patch does not cause forks to revert state', function () {
    const parent = new Microcosm()
    const child = parent.fork()

    child.addDomain('count', {
      register () {
        return {
          'add' : (a, b) => a + b
        }
      }
    })

    child.patch({ count: 2 })

    child.push('add', 1)
    child.push('add', 1)

    // Forks inherit state. If a parent repo's state contains a key, it will
    // pass the associated value down to a child. This allows state to flow
    // downward through the repo network.
    //
    // Unfortunately, this causes an unexpected behavior with `patch` where
    // consecutive actions always operate on the original patched value, and not
    // the new state produced by a child.
    expect(child.state.count).toEqual(4)
  })
})

describe('reset', function () {
  test('reset does not cause forks to revert state', function () {
  const parent = new Microcosm()
  const child = parent.fork()

  child.addDomain('count', {
    register () {
      return {
        'add' : (a, b) => a + b
      }
    }
  })

  child.reset({ count: 2 })

  child.push('add', 1)
  child.push('add', 1)

  // Forks inherit state. If a parent repo's state contains a key, it will
  // pass the associated value down to a child. This allows state to flow
  // downward through the repo network.
  //
  // Unfortunately, this causes an unexpected behavior with `patch` where
  // consecutive actions always operate on the original patched value, and not
  // the new state produced by a child.
  expect(child.state.count).toEqual(4)
})
})
