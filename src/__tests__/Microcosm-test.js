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
    it ('runs deserialize before committing results', function(done) {
      let spy    = sinon.spy(app, 'deserialize')
      let sample = { dummy: 'test' }

      app.listen(function() {
        spy.should.have.been.calledWith(sample)
        app.get('dummy').should.equal('test')
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

    describe('when sending an action with callback', function() {

      it ('sends a message to the dispatcher', function(done) {
        sinon.spy(app, 'dispatch')

        app.push((params, next) => setTimeout(next, 100), 'params', function() {
          app.dispatch.should.have.been.called
          done()
        })
      })

      it ('does not dispatch when an error is provided', function(done) {
        let warn = (params, next) => next('issue')

        sinon.spy(app, 'dispatch')

        app.push(warn, 'params', function(error) {
          error.should.equal('issue')
          app.dispatch.should.not.have.been.called
          done()
        })
      })
    })

    describe('when sending an action that returns a promise', function() {
      it ('sends a messages to the dispatcher', function(done) {
        sinon.spy(app, 'dispatch')

        app.push(i => Promise.resolve(i), true).then(function() {
          app.dispatch.should.have.been.called
          done()
        })
      })

      it ('does not dispatch a rejected promise', function(done) {
        let warn = params => Promise.reject('issue')

        sinon.spy(app, 'dispatch')

        app.push(warn, 'params').catch(function(error) {
          error.should.equal('issue')
          app.dispatch.should.not.have.been.called
          done()
        })
      })
    })

    describe('when sending an action that returns a value', function() {

      it ('sends a messages to the dispatcher', function() {
        let add = (one, two) => one + two

        sinon.spy(app, 'dispatch')

        app.push(add, 1, 2)

        app.dispatch.should.have.been.calledWith(add, 3)
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
      let a   = sinon.mock()
      let b   = sinon.mock()

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
