import Items from '../Items'

describe('Items Store', function() {

  it ('sets its default state to an empty array', function() {
    Items.getInitialState().should.eql([])
  })

})
