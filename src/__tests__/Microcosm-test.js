let Action     = require('./fixtures/Action')
let DummyStore = require('./fixtures/DummyStore')
let Microcosm  = require('../Microcosm')
let Store      = require('../Store')

describe('Microcosm', function() {
  let app;

  beforeEach(function(done) {
    app = new Microcosm()
    app.addStore('dummy', DummyStore)
    app.start(done)
  })

  describe('::replace', function() {
    it ('runs deserialize before committing results', function(done) {
      let spy    = sinon.spy(app, 'deserialize')
      let sample = { dummy: 'different' }

      app.listen(function() {
        spy.should.have.been.calledWith(sample)
        app.get('dummy').should.equal('different')
        done()
      })

      app.replace(sample)
    })
  })

  describe('::push', function() {
    it ('throws an error if asked to push a non-function value', function(done) {
      try {
        app.push(null)
      } catch(x) {
        x.should.be.instanceof(TypeError)
        done()
      }
    })
  })

  describe('::prepare', function() {
    it ('partially applies an action', function() {
      sinon.stub(app, 'push')
      app.prepare(Action, 'arg')()
      app.push.should.have.been.calledWith(Action, 'arg')
    })
  })

  describe('::toObject', function() {
    it ('aliases valueOf', function() {
      app.toObject().should.eql(app.valueOf())
    })
  })

  describe('::addStore', function() {
    it ('throws an error if no key is given', function(done) {
      try {
        new Microcosm().addStore({})
      } catch(x) {
        x.should.be.instanceOf(TypeError)
        done()
      }
    })
  })

  describe('::toObject', function() {
    it ('aliases valueOf', function() {
      sinon.spy(app, 'valueOf')
      app.toObject()
      app.valueOf.should.have.been.called
    })
  })

  describe('::prepare', function() {
    it ('binds arguments to push', function() {
      sinon.stub(app, 'push')
      app.prepare('action', 1, 2)(3)
      app.push.should.have.been.calledWith('action', 1, 2, 3)
    })
  })

  describe('::dispatch', function() {
    let local, action;

    beforeEach(function(done) {
      action = function respond () {}
      local = new Microcosm()
      local.addStore('another-store', {
        register() {
          return { [action]: () => true }
        }
      })
      local.start(done)
    })

    it ('commits changes if a store can respond', function(done) {
      local.listen(_ => done())
      local.push(action)
    })
  })

  describe('::addPlugin', function() {
    it ('pushes a plugin into a list', function(done) {
      let app = new Microcosm()

      app.addPlugin({
        register(app, options, next) {
          done()
        }
      })

      app.start()
    })
  })

  describe('::serialize', function() {
    it ('can serialize to JSON', function() {
      sinon.spy(app, 'serialize')

      let data = app.toJSON()

      data.should.have.property('dummy', 'test')
      app.serialize.should.have.been.called
    })

    it ('runs through serialize methods on stores', function() {
      app.addStore('serialize-test', {
        getInitialState() {
          return 'this will not display'
        },
        serialize() {
          return 'this is a test'
        }
      })

      app.toJSON().should.have.property('serialize-test', 'this is a test')
    })
  })

  describe('::deserialize', function() {
    [ null, undefined ].forEach(function(type) {
      it (`handles cases where the value is ${ type }`, function() {
        app.addStore('fiz', {})

        let cleaned = app.deserialize(type)

        cleaned.should.not.have.property('fiz')
      })
    })
  })

  describe('::start', function() {
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

    it ('throws an error if given a non-function callback', function() {
      let app = new Microcosm()

      try {
        app.start('this will break')
      } catch(error) {
        error.should.be.instanceof(TypeError)
        error.message.should.include('start')
      }
    })
  })

})
