import Lists from '../Lists'

describe('Lists Store', function() {

  it ('sets its default state to an empty array', function() {
    Lists.getInitialState().should.eql([])
  })

  it ('sets a contrasting color when creating a record', function() {
    let a = Lists.add([], { color: '#000000' })
    a.pop().contrast.should.equal('white')

    let b = Lists.add([], { color: 'ffffff' })
    b.pop().contrast.should.equal('black')
  })

})
