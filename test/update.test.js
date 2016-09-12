import test from 'ava'
import update from '../src/update'

test('returns the original subject if assigning the same the value', t => {
  const first = { color: 'red' }
  const second = update.set(first, 'color', 'red')

  t.is(first, second)
})

test('returns the original subject if assigning to no key and the value is the same', t => {
  const first = { color: 'red' }
  const second = update.set(first, null, first)

  t.is(first, second)
})

test('returns a new object, preserving the original', t => {
  const first = { color: 'red' }
  const second = update.set(first, 'color', 'blue')

  t.not(first, second)
})
