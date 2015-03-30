import Microcosm  from '../Microcosm'

describe('Plugins', function() {

  it ('can add plugins', function(done) {
    let m = new Microcosm()

    m.addPlugin({
      register(app, options, next) {
        app.should.equal(m)
        next()
      }
    })

    m.start(done)
  })

  it ('throws an error if the register method is not defined', function(done) {
    let m = new Microcosm()

    try {
      m.addPlugin({})
    } catch (x) {
      done()
    }
  })

  it ('allows plugins to throw errors', function(done) {
    let m = new Microcosm()

    m.addPlugin({
      register: function(app, options, next) {
        next(new Error())
      }
    })

    try {
      m.start()
    } catch (x) {
      done()
    }
  })

})
