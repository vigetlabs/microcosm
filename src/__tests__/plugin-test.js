let Microcosm = require('../Microcosm')
let assert = require('assert')

describe('Plugins', function() {

  it ('halts installation of plugins on error', function(done) {
    let app = new Microcosm()

    app.addPlugin({
      register(app, options, next) {
        next('error')
      }
    })

    app.addPlugin({
      register(app, options, next) {
        throw new Error('second plugin should not have registered')
      }
    })

    app.start(function(error) {
      assert.equal(error, 'error')
      done()
    })
  })

  it ('installs plugins sequentially to add order', function(done) {
    let app  = new Microcosm()
    let step = 0

    app.addPlugin({
      register(app, options, next) {
        step = step + 1
        assert.equal(step, 1)
        next()
      }
    })

    app.addPlugin({
      register(app, options, next) {
        step = step + 1
        assert.equal(step, 2)
        next()
      }
    })

    app.start(done)
  })

  it ('throws an error if adding a plugin without a register method', function(done) {
    let app  = new Microcosm()

    try {
      app.addPlugin({})
    } catch(error) {
      assert(error instanceof TypeError)
    }

    app.start(done)
  })

  it ('each instance is unique', function(done) {
    let app  = new Microcosm()
    let instances = []

    let Plugin = {
      register(app, options, next) {
        instances.push(this)
        next()
      }
    }

    app.addPlugin(Plugin)
    app.addPlugin(Plugin)

    app.start(function() {
      instances[0].dirty = true
      assert.equal('dirty' in instances[1], false)
    }, done)
  })

  it ('throws an error if a register property is not a function', function(done) {
    let app = new Microcosm()

    let Plugin = {
      register: 'booyah'
    }

    app.addPlugin(Plugin)

    try {
      app.start()
    } catch(error) {
      assert(error instanceof TypeError)
      done()
    }
  })

  it ('does not throw error if no register property is given', function() {
    return new Microcosm().addPlugin({})
  })
})
