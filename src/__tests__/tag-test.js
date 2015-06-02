let tag = require('../tag')

describe('tag', function() {

  it ('includes the function name', function() {
    tag(function test() {}).toString().should.include('test')
  })

  it ('assigns a default name', function() {
    tag({}).toString().should.include('microcosm_action')
  })

})
