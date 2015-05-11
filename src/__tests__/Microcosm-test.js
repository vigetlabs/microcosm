let Action     = require('./fixtures/Action')
let DummyStore = require('./fixtures/DummyStore')
let Microcosm  = require('../Microcosm')

describe('Microcosm', function() {
  let app;

  beforeEach(function(done) {
    app = new Microcosm()
    app.addStore('dummy', DummyStore)
    app.start(done)
  })

  describe('Microcosm::replace', function() {
    it ('runs deserialize before committing results', function() {
      app.replace({ dummy: 'test' })
      app.get('dummy').should.equal('test')
    })

    it ('leads to an event', function(done) {
      app.listen(done)
      app.replace({ dummy: 'test' })
    })
  })

  describe('Microcosm::prepare', function() {
    it ('partially apply Microcosm::push', function() {
      let add = (a=0, b=0) => a + b

      app.prepare(add)(2, 3).should.equal(5)
      app.prepare(add, 4)(1).should.equal(5)
      app.prepare(add)(1).should.equal(1)
    })
  })

  describe('Microcosm:push', function() {
    it ('sends a messages to the dispatcher', function() {
      sinon.spy(app, 'dispatch')
      app.push(Action)
      app.dispatch.should.have.been.calledWith(Action, true)
    })

    it ('can send async messages to the dispatcher', function(done) {
      let Async = () => Promise.resolve(true)

      sinon.spy(app, 'dispatch')

      app.push(Async).then(function() {
        app.dispatch.should.have.been.calledWith(Async, true)
        done()
      })
    })

    it ('throws an error if not sent a truthy', function(done) {
      try {
        app.push(undefined)
      } catch(x) {
        done()
      }
    })
  })

  describe('Microcosm::dispatch', function() {
    let local;

    beforeEach(function(done) {
      local = new Microcosm()
      local.addStore('another-store', { respond: () => true })
      local.start(done)
    })

    it ('does not emit a change if no handler responds', function() {
      local.listen(function() {
        throw Error("Expected app to not respond but did")
      })

      local.dispatch(Action)
    })

    it ('commits changes if a store can respond', function(done) {
      local.listen(done)
      local.dispatch('respond')
    })

  })

  describe('Microcosm::addPlugin', function() {
    it ('pushes a plugin into a list', function() {
      app.addPlugin({ register() {} })
      app.plugins.length.should.equal(1)
    })
  })

  describe('Microcosm::addStore', function() {
    it ('can add stores', function() {
      app.stores.should.have.property('dummy')
    })
  })

  describe('Microcosm::serialize', function() {
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

  describe('Microcosm::deserialize', function() {
    it ('can handle undefined arguments in deserialize', function() {
      app.addStore({ toString() { return 'fiz' } })
      app.deserialize()
    })
  })

  describe('Microcosm::start', function() {
    it ('can run multiple callbacks', function(done) {
      let app = new Microcosm()
      let a   = sinon.mock()
      let b   = sinon.mock()

      app.start(a, b, function() {
        a.should.have.been.called
        b.should.have.been.called
        done()
      })
    })
  })

})
