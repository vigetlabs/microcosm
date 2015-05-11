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

  describe('::replace', function() {
    it ('runs deserialize before committing results', function() {
      app.replace({ dummy: 'test' })
      app.get('dummy').should.equal('test')
    })

    it ('leads to an event', function(done) {
      app.listen(done)
      app.replace({ dummy: 'test' })
    })
  })

  describe('::prepare', function() {
    it ('partially apply ::push', function() {
      app.prepare(a => a + 2, 3)(function(error, result) {
        result.should.equal(5)
      })
    })
  })

  describe('::push', function() {

    it ('sends a messages to the dispatcher', function(done) {
      sinon.spy(app, 'dispatch')

      app.push((params, done) => done(), 'params', function() {
        app.dispatch.should.have.been.called
        done()
      })
    })

    it ('can send async messages to the dispatcher', function(done) {
      let Async = function(params, next) {
        setTimeout(next, 100)
      }

      sinon.spy(app, 'dispatch')

      app.push(Async, 'params', function() {
        app.dispatch.should.have.been.called
        done()
      })
    })

    it ('does not dispatch errors', function(done) {
      let warn = (params, next) => next('issue')

      sinon.spy(app, 'dispatch')

      app.push(warn, 'params', function(error) {
        error.should.equal('issue')
        app.dispatch.should.not.have.been.called
        done()
      })
    })

  })

  describe('::dispatch', function() {
    let local;

    beforeEach(function(done) {
      local = new Microcosm()
      local.addStore('another-store', { respond: () => true })
      local.start(done)
    })

    it ('commits changes if a store can respond', function(done) {
      local.listen(done)
      local.dispatch('respond')
    })

  })

  describe('::addPlugin', function() {
    it ('pushes a plugin into a list', function() {
      app.addPlugin({ register() {} })
      app.plugins.length.should.equal(1)
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
    it ('handles undefined arguments', function() {
      app.addStore('fiz', {})
      app.deserialize()
    })
  })

  describe('::start', function() {
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
