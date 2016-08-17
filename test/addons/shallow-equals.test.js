import test from 'ava'
import shallowEqual from '../../src/addons/presenter/shallow-equal'

test('returns true when given the exact same object', t => {
  const sample = {}

  t.is(shallowEqual(sample, sample), true)
})

test('returns true when given the exact same keys', t => {
  t.is(shallowEqual({ one: 1 }, { one: 1 }), true)
})

test('returns false when the key count is different', t => {
  const a = { foo: 'bar' }
  const b = { foo: 'bar', another: true }

  t.is(shallowEqual(a, b), false)
  t.is(shallowEqual(b, a), false)
})

test('returns false when given the exact different keys', t => {
  const a = { name: 'Bill' }
  const b = { name: 'Cindy' }

  t.is(shallowEqual(a, b), false)
})
