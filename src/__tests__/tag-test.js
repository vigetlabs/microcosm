import tag from '../tag'

describe('tag', function() {
  let sample = {
    boolean: true,
    method() { return 'bar' }
  }

  it ('should include the method name within the string name', function() {
    `${ tag(sample).method }`.should.include('method')
  })

  it ('only operates on functions', function() {
    `${ tag(sample).boolean }`.should.equal('true')
  })

})
