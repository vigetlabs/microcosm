let install = require('../install')
let Plugin  = require('../Plugin')

describe('install', function() {
  let app = {}

  it ('registers a list of plugins', function(done) {
    let plugin = new Plugin({
      register(app, options, next) {
        next()
      }
    })

    install([plugin], app, done)
  })

  it ('can throw errors', function(done) {
    let plugin = new Plugin({
      register(app, options, next) {
        next('error')
      }
    })

    try {
      install([plugin], app)
    } catch(reason) {
      reason.should.equal('error')
      done()
    }

  })

})
