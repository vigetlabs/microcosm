import Lists       from '../Lists'
import ListActions from '../../actions/lists'
import Foliage     from 'foliage'

describe('Lists Store', function() {

  it ('sets its default state to an empty object', function() {
    Lists.getInitialState().should.eql({})
  })

  it ('sets a contrasting color when creating a record', function() {
    let state = new Foliage()

    Lists[ListActions.add](state, { color: '#000000' })
    state.last().contrast.should.equal('white')

    Lists[ListActions.add](state, { color: 'ffffff' })
    state.last().contrast.should.equal('black')
  })

})
