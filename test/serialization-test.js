let Microcosm = require('../src/Microcosm')
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

  it ('sends all state as the second argument', function(done) {
    let app = new Microcosm()

    app.addStore('serialize-test', {
      serialize(subset, state) {
        assert.equal(state, app.state)
        done()
      }
    })

    app.start().toJSON()
  })

  it ('properly deserializes nully values', function() {
    let app = new Microcosm()

    app.addStore('fiz', {})

    assert.equal(false, 'fiz' in app.deserialize(null))
    assert.equal(false, 'fiz' in app.deserialize(undefined))
  })

  it ('defaults to getInitialState when no deserialize method is provided', function(done) {
    let app = new Microcosm()

    app.addStore('fiz', {
      getInitialState() {
        return true
      }
    })

    app.replace({}, function() {
      assert.deepEqual(app.state, { fiz: true })
      done()
    })
  })

  it ('passes the raw data as the seconda argument of deserialize', function(done) {
    let app = new Microcosm()

    app.addStore('fiz', {
      deserialize(subset, raw) {
        assert.equal(subset, 'buzz')
        assert.deepEqual(raw, { fiz: 'buzz' })
        done()
      }
    })

    app.start()
    app.deserialize({ fiz: 'buzz'})
  })
})
