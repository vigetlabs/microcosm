import test from 'ava'
import Microcosm from '../src/microcosm'

test('forks inherit state', t => {
  const parent = new Microcosm()
  const child = parent.fork()

  parent.reset({ foo: 'bar' })

  t.is(child.state.foo, 'bar')
})

test('pushing actions on the child float up to the parent', t => {
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

  t.is(parent.state.color, 'red')
  t.is(parent.state.shape, undefined)
  t.is(child.state.color, 'red')
  t.is(child.state.shape, 'triangle')

  child.push(setShape, 'square')
  child.push(setColor, 'blue')

  t.is(parent.state.color, 'blue')
  t.is(parent.state.shape, undefined)
  t.is(child.state.color, 'blue')
  t.is(child.state.shape, 'square')
})

test('pushing actions on the parent sink down to children', t => {
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

  t.is(parent.state.color, 'red')
  t.is(parent.state.shape, undefined)
  t.is(child.state.color, 'red')
  t.is(child.state.shape, 'triangle')

  parent.push(setShape, 'square')
  parent.push(setColor, 'blue')

  t.is(parent.state.color, 'blue')
  t.is(parent.state.shape, undefined)
  t.is(child.state.color, 'blue')
  t.is(child.state.shape, 'square')
})

test('forks from the same parent propagate', t => {
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

  t.is(parent.state.color, 'blue')
  t.is(right.state.color, 'blue')
  t.is(left.state.color, 'blue')
})

test('tearing down eliminates parent subscriptions', t => {
  const parent = new Microcosm()
  const child =  parent.fork()

  parent.replace({ color: 'red' })

  child.on('change', function() {
    throw new Error('Should not have changed')
  })

  child.teardown()

  parent.replace({ color: 'blue' })

  t.is(parent.state.color, 'blue')
  t.is(child.state.color, 'red')
})

test('it deeply inherits state', t => {
  const tree = new Microcosm({ maxHistory: Infinity })

  tree.replace({ color: 'red' })

  const branch = tree.fork()
  const leaf = branch.fork()

  t.is(branch.state.color, 'red')

  t.is(leaf.state.color, 'red')
})
