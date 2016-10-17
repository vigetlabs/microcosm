import tag  from '../src/tag'

test('includes the function name', function () {
  const tagged = tag(function test() {})

  expect(`${tagged}`.search('test')).toEqual(0)
})

test('assigns a default name', function () {
  const tagged = tag(n => n)

  expect(`${tagged}`).toContain('microcosm_action')
})

test('will not tag a null action', function () {
  expect(() => tag(null)).toThrow(/Unable to identify null action/)
})

test('will not tag an undefined action', function () {
  expect(() => tag(undefined), /Unable to identify undefined action/)
})

test('can have an override name', function () {
  const tagged = tag(function(){}, 'test')

  expect(`${tagged}`).toEqual('test')
})

test('is unique', function () {
  let a = tag(function(){}).toString()
  let b = tag(function(){}).toString()

  expect(a).not.toEqual(b)
})
