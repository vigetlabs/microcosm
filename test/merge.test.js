import test from 'ava'
import merge from '../src/merge'

test('will not merge a null value into an object', t => {
  const a = {}
  const b = null

  t.is(merge(a, b), a)
})

test('will not merge into null', t => {
  const a = null
  const b = {}

  t.is(merge(a, b), null)
})

test('will not merge a property it does not own', t => {
  const proto = { red: true }
  const child = Object.create(proto)

  t.deepEqual(merge({}, child), {})
})

test('merges many arguments', t => {
  const a = { red: true }
  const b = { green: true }
  const c = { blue: true }

  t.deepEqual(merge(a, b, c), { red: true, green: true, blue: true })
})
