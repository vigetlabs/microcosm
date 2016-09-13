import test from 'ava'
import tag  from '../src/tag'

test('includes the function name', t => {
  t.is(tag(function test() {}).toString().search('test'), 0)
})

test('will not tag a null action', t => {
  t.throws(function () {
    tag(null)
  }, /Unable to identify null action/)
})

test('will not tag an undefined action', t => {
  t.throws(function () {
    tag(undefined)
  }, /Unable to identify undefined action/)
})

test('assigns a default name', t => {
  t.is(tag(n => n).toString().search('microcosm_action'), 0)
})

test('can have an override name', t => {
  t.is(tag(function(){}, 'test').toString(), 'test')
})

test('is unique', t => {
  let a = tag(function(){}).toString()
  let b = tag(function(){}).toString()

  t.not(a, b)
})
