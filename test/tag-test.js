import States from '../src/action/states'
import tag    from '../src/action/tag'
import assert from 'assert'

describe('tag', function() {
  it ('includes the function name', function() {
    assert.equal(tag(function test() {}).toString().search('test'), 0)
  })

  it ('assigns a default name', function() {
    assert.equal(tag(function(){}).toString().search('microcosm_action'), 0)
  })

  it ('can have an override name', function() {
    assert.equal(tag(function(){}, 'test').toString(), 'test')
  })

  describe('States', function() {
    for (let key in States) {
      it (`has the ${ key } state`, function() {
        assert(key.toLowerCase() in tag(() => {}), `Expected function to have ${ key.toLowerCase() } property`)
      })
    }
  })
})
