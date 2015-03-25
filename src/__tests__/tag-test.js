import tag from '../tag'

describe('tag', function() {
  let sample = {
    method() { return 'bar' },
    boolean: true
  }

  it ('should include the method name within the string name', function() {
    return `${ tag(sample).method }`.should.include('method')
  })

  it ('only operates on functions', function() {
    return `${ tag(sample).boolean }`.should.equal('true')
  })

})
