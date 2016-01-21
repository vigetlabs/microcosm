let Microcosm = require('../src/Microcosm')
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

    app.start(function(error) {
      instances[0].dirty = true
      assert.equal('dirty' in instances[1], false)
      done(error)
    })
  })

  it ('throws an error if a register property is not a function', function(done) {
    let app = new Microcosm()

    try {
      app.addPlugin({ register: 'booyah' })
    } catch(error) {
      assert(error instanceof TypeError)
      done()
    }
  })

  it ('throws an error if a register is missing', function() {
    assert.throws(function() {
      new Microcosm().addPlugin({})
    })
  })

  it ('throws an error when passed no configuration data', function() {
    assert.throws(function() {
      new Microcosm().addPlugin()
    })
  })

  it ('a plugin can be a function', function (done) {
    let app = new Microcosm()

    app.addPlugin(function(app, _, next) {
      done()
    })

    app.start()
  })

  it ('just calls through plugins that have no next callback', function(done) {
    let app = new Microcosm()

    app.addPlugin(function(app, _) {
      app.didAddPlugin = true
    })

    app.start(function(errors) {
      assert.equal(app.didAddPlugin, true)
      done(errors)
    })
  })

  it ('plugins can have options', function(done) {
    let app = new Microcosm()

    app.addPlugin(function testDefaultOptions (app, options) {
      assert.equal(options.test, true)
      done()
    }, { test: true })

    app.start()
  })

  it ('plugins always have a default options object', function(done) {
    let app = new Microcosm()

    app.addPlugin(function testDefaultOptions (app, options) {
      assert.deepEqual(options, {})
      done()
    })

    app.start()
  })
})
