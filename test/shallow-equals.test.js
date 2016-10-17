import shallowEqual from '../src/shallow-equal'

test('returns true when given the exact same object', function () {
  const sample = {}

  expect(shallowEqual(sample, sample)).toBe(true)
})

test('returns true when given the exact same keys', function () {
  expect(shallowEqual({ one: 1 }, { one: 1 })).toBe(true)
})

test('returns false when the key count is different', function () {
  const a = { foo: 'bar' }
  const b = { foo: 'bar', another: true }

  expect(shallowEqual(a, b)).toBe(false)
  expect(shallowEqual(b, a)).toBe(false)
})

test('returns false when given the exact different keys', function () {
  const a = { name: 'Bill' }
  const b = { name: 'Cindy' }

  expect(shallowEqual(a, b)).toBe(false)
})

test('returns false if one of the objects is null', function () {
  const a = { name: 'Bill' }

  expect(shallowEqual(a, null)).toBe(false)
  expect(shallowEqual(null, a)).toBe(false)
})
