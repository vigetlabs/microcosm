import Signal from '../Signal'

describe('Signal', function() {

  it ('throws an error if its given action is not a function', function(done) {
    try {
      new Signal(null)
    } catch(error) {
      error.should.be.instanceOf(TypeError)
      done()
    }
  })

  it ('waits for promises before calling next', function(done) {
    let signal = new Signal(params => Promise.resolve(params), [true])

    signal.pipe(params => {
      params.should.equal(true)
      done()
    })
  })

})
