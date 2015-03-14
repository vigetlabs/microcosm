import Heartbeat from '../heartbeat'

describe ('Heartbeat', function() {
  let heart

  beforeEach(() => heart = Heartbeat())

  it ('does not flush if there are no callbacks', function() {
    let spy = sinon.spy(window, 'requestAnimationFrame')

    heart.beat()

    spy.should.not.have.been.called

    spy.restore()
  })

  it ('can listen to callbacks', function(done) {
    heart.listen(done)
    heart.beat()
  })

  it ('batches subscriptions', function(done) {
    let stub = sinon.stub()

    heart.listen(stub)

    for (var i = 100; i > 0; i--) {
      heart.beat()
    }

    requestAnimationFrame(() => {
      stub.should.have.been.calledOnce
      done()
    })
  })

  it ('can ignore callbacks', function(done) {
    let stub = sinon.stub()

    heart.listen(stub)
    heart.ignore(stub)
    heart.beat()

    requestAnimationFrame(() => {
      stub.should.not.have.been.called
      done()
    })
  })

})
