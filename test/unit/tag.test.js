import { tag } from '../../src/microcosm'

describe('tag', function() {
  it('includes the function name', function() {
    const tagged = tag(function test() {})

    expect(`${tagged}`.search('test')).toEqual(0)
  })

  it('assigns a default name', function() {
    const tagged = tag(n => n)

    expect(`${tagged}`).toContain('_action')
  })

  it.strict('will not tag a null action', function() {
    expect(() => tag(null)).toThrow(/Unable to identify null action/)
  })

  it.strict('will not tag an undefined action', function() {
    expect(() => tag(undefined), /Unable to identify undefined action/)
  })

  it('can have an override name', function() {
    const tagged = tag(function() {}, 'test')

    expect(`${tagged}`).toEqual('test')
  })

  it('tagged strings return identity functions', function() {
    const tagged = tag('test')

    expect(tagged(1)).toBe(1)
  })

  it('is unique', function() {
    let a = tag(function() {}).toString()
    let b = tag(function() {}).toString()

    expect(a).not.toEqual(b)
  })
})
