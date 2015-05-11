import remap from '../remap'

describe('remap', function() {
  let first, second;

  beforeEach(function() {
    first  = { a: 1 }
    second = remap(first, value => value + 1)
  })

  it ('returns a new object', function() {
    second.should.not.equal(first)
  })

  it ('transforms each key according to the provided function', function() {
    second.should.have.property('a', 2)
  })

})
