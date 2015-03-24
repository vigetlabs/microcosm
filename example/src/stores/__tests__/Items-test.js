import Items from '../Items'

describe('Items Store', function() {

  it ('sets its default state to an empty array', function() {
    Items.getInitialState().should.eql([])
  })

  it ('returns provided state if given', function() {
    let seed = [{}]
    Items.getInitialState(seed).should.eql(seed)
  })

})
