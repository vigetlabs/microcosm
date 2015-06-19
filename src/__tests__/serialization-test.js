let Microcosm = require('../Microcosm')

describe('Serialization', function() {

  it ('runs through serialize methods on stores', function() {
    let app = new Microcosm()

    app.addStore('serialize-test', {
      getInitialState() {
        return 'this will not display'
      },
      serialize() {
        return 'this is a test'
      }
    })

    app.toJSON().should.have.property('serialize-test', 'this is a test')
  })

  it ('properly deserializes nully values', function() {
    let app = new Microcosm()

    app.addStore('fiz', {})

    app.deserialize(null).should.not.have.property('fiz')
    app.deserialize(undefined).should.not.have.property('fiz')
  })
})
