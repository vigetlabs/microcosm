let Action      = require('./fixtures/Action')
let DummyStore  = require('./fixtures/DummyStore')
let Microcosm   = require('../Microcosm')
let Store       = require('../Store')
let Transaction = require('../Transaction')

describe('Microcosm', function() {
  let app;

  beforeEach(function(done) {
    app = new Microcosm()
    app.addStore('dummy', DummyStore)
    app.start(done)
  })

  it ('can be extended - Address loose mode Babel bug', function() {
    class MyApp extends Microcosm {
      constructor() {
        super()
        this.addStore('foo', {})
      }
    }

    new MyApp().stores.should.have.property('foo')
  })

  describe('reset', function() {
    let dummy = Transaction.create('test')
    let transactions = [dummy]

    it ('can reset with specific transactions', function() {
      app.reset({}, transactions).transactions.should.eql([dummy])
    })

    it ('copies the array when given transactions on reset', function() {
      app.reset({}, transactions).transactions.should.not.equal(transactions)
    })
  })

  it ('deserializes when replace is invoked', function(done) {
    let spy    = sinon.spy(app, 'deserialize')
    let sample = { dummy: 'different' }

    app.listen(function() {
      spy.should.have.been.calledWith(sample)
      app.state.dummy.should.equal('different')
      done()
    })

    app.replace(sample)
  })

  it ('binds arguments to push', function() {
    sinon.stub(app, 'push')
    app.prepare('action', [ 1, 2 ])(3)
    app.push.should.have.been.calledWith('action', [ 1, 2, 3 ])
  })

  it ('prepare handles cases with no arguments', function() {
    sinon.stub(app, 'push')

    app.prepare('action')(3)
    app.push.should.have.been.calledWith('action', [ 3 ])

    app.prepare('action', 3)(1)
    app.push.should.have.been.calledWith('action', [ 3, 1 ])
  })

  it ('throws an error if asked to push a non-function value', function(done) {
    try {
      app.push(null)
    } catch(x) {
      x.should.be.instanceof(TypeError)
      done()
    }
  })

  it ('throws an error if no key is given in addStore', function(done) {
    try {
      new Microcosm().addStore({})
    } catch(x) {
      x.should.be.instanceOf(TypeError)
      done()
    }
  })

  it ('can run multiple callbacks', function(done) {
    let app = new Microcosm()
    let a   = sinon.stub()
    let b   = sinon.stub()

    app.start(a, b, function() {
      a.should.have.been.called
      b.should.have.been.called
      done()
    })
  })
})
