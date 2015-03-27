import pulse from '../pulse'

describe ('Pulse', function() {
  let heart

  beforeEach(() => heart = pulse())

  it ('can listen to callbacks', function(done) {
    heart.listen(done)
    heart.pump()
  })

  it ('can ignore callbacks', function() {
    let stub = sinon.stub()

    heart.listen(stub)
    heart.ignore(stub)

    heart.pump()

    stub.should.not.have.been.called
  })

})
