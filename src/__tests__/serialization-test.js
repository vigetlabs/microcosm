let Microcosm = require('../Microcosm')
let assert = require('assert')

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

    assert.equal(app.toJSON()['serialize-test'], 'this is a test')
  })

  it ('properly deserializes nully values', function() {
    let app = new Microcosm()

    app.addStore('fiz', {})

    assert.equal(false, 'fiz' in app.deserialize(null))
    assert.equal(false, 'fiz' in app.deserialize(undefined))
  })
})
