let Microcosm = require('../Microcosm')

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
      error.should.equal('error')
      done()
    })
  })

  it ('installs plugins sequentially to add order', function(done) {
    let app  = new Microcosm()
    let step = 0

    app.addPlugin({
      register(app, options, next) {
        step = step + 1
        step.should.equal(1)
        next()
      }
    })

    app.addPlugin({
      register(app, options, next) {
        step = step + 1
        step.should.equal(2)
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
      error.should.be.instanceOf(TypeError)
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
      instances[1].should.not.have.property('dirty')
    }, done)
  })
})
