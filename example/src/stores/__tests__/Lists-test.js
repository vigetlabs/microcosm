import Lists       from '../Lists'
import ListActions from '../../actions/lists'

describe('Lists Store', function() {

  it ('sets its default state to an empty array', function() {
    Lists.getInitialState().should.eql([])
  })

  it ('returns provided state if given', function() {
    let seed = [{}]
    Lists.getInitialState(seed).should.eql(seed)
  })

  it ('sets a contrasting color when creating a record', function() {
    Lists[ListActions.add]([], { color: '#000000' })[0].should.have.property('contrast', 'white')
    Lists[ListActions.add]([], { color: 'ffffff' })[0].should.have.property('contrast', 'black')
  })

})
