let Plugin  = require('../Plugin')

describe('Plugin', function() {
  it ('stringifies based on a given name', function() {
    let a = new Plugin({ name: 'test'})

    a.toString().should.equal('test')
  })

  it ('stringifies to a unique name if none given', function() {
    let a = new Plugin()
    let b = new Plugin()

    a.toString().should.not.equal(b.toString())
  })

  it ('can be registered', function(done) {
    let a = new Plugin()

    a.register(null, null, done)
  })
})
