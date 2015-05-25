let tag = require('../tag')

describe('tag', function() {

  it ('includes the function name', function() {
    tag(function test() {}).toString().should.include('test')
  })

})
