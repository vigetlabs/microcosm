import { tag } from 'microcosm'

describe('tag', function() {
  it('includes the function name', function() {
    const tagged = tag(function test() {})

    expect(`${tagged}`.search('test')).toEqual(0)
  })

  it('assigns a default name', function() {
    const tagged = tag(n => n)

    expect(`${tagged}`).toContain('_action')
  })

  it('can have an override name', function() {
    const tagged = tag(function() {}, 'test')

    expect(`${tagged}`).toEqual('test')
  })

  it('is unique', function() {
    let a = tag(function() {}).toString()
    let b = tag(function() {}).toString()

    expect(a).not.toEqual(b)
  })
})
