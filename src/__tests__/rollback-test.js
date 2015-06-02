import Microcosm from '../Microcosm'

describe('Microcosm::rollback', function() {

  it ('respects state from new keys', function() {
    let app    = new Microcosm()
    let first  = { one: 2 }
    let second = { two : 2 }

    app.set({ one: 1 })
    app.update(second)
    app.rollback(first)

    app.get('one').should.equal(1)
    app.get('two').should.equal(2)
  })

  it ('respects state from existing keys', function() {
    let me     = new Microcosm()
    let base   = { name: 'Nate', eyes: 'blue' }
    let first  = { name: 'Phil', eyes: 'green' }
    let second = { name: 'Ben', height: '6' }

    // A user starts with a name
    me.set(base)

    // That name gets updated
    me.update(first)

    // That name gets updated again
    me.update(second)

    // Rolling back the first change
    me.rollback(base, first)

    me.get('name').should.equal('Ben')
    me.get('eyes').should.equal('blue')
    me.get('height').should.equal('6')
  })


})
