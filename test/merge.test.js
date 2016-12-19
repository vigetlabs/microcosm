import { merge } from '../src/utils'

test('will not merge a null value into an object', function () {
  const a = {}
  const b = null

  expect(merge(a, b)).toEqual(a)
})

test('will not merge into null', function () {
  const a = null
  const b = {}

  expect(merge(a, b)).toEqual(null)
})

test('merges many arguments', function () {
  const a = { red: true }
  const b = { green: true }
  const c = { blue: true }

  expect(merge(a, b, c)).toEqual({ red: true, green: true, blue: true })
})
