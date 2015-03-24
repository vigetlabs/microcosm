import transpose from '../transpose'

describe ('transpose', function() {

  it ('defaults its initial state to an empty object', function() {
    transpose({}, (i => i)).should.eql({})
  })

  it ('can set an initial state', function() {
    transpose({}, (i => i), { fizz: 'baz' }).should.eql({ fizz: 'baz' })
  })

})
