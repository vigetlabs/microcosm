import Action     from './fixtures/Action'
import DummyStore from './fixtures/DummyStore'
import Microcosm  from '../Microcosm'

describe('Microcosm', function() {
  let app;

  beforeEach(function(done) {
    app = new Microcosm()
    app.addStore(DummyStore)
    app.start(done)
  })

  describe('Microcosm::replace', function() {
    it ('runs deserialize before committing results', function() {
      app.replace({ dummy: 'test' })
      app.pull(DummyStore).should.equal('test')
    })

    it ('leads to an event', function(done) {
      app.listen(done)
      app.replace({ dummy: 'test' })
    })
  })

  describe('Microcosm::pull', function() {
    it ('pulls default state for a store if it has not been assigned', function() {
      app.pull(DummyStore).should.equal(DummyStore.getInitialState())
    })

    it ('can process data directly from pull', function() {
      let answer = app.pull(DummyStore, i => DummyStore.getInitialState())
      answer.should.equal(DummyStore.getInitialState())
    })

    it ('can inject additional arguments', function() {
      let is = (a, b) => a === b

      app.pull(DummyStore, is, 'test').should.equal(true)
      app.pull(DummyStore, is, 'fiz').should.equal(false)
    })
  })

  describe('Microcosm::_commit', function() {
    it ('assigns new state', function() {
      app._commit({ foo: 'bar' })
      app.pull('foo').should.equal('bar')
    })

    it ('leads to an event', function(done) {
      app.listen(done)
      app._commit('test')
    })
  })

  describe('Microcosm::prepare', function() {
    it ('partially apply Microcosm::push', function() {
      let add = (a=0, b=0) => a + b

      app.prepare(add)(2, 3).should.equal(5)
      app.prepare(add, 4)(1).should.equal(5)
      app.prepare(add)(1).should.equal(1)
    })

    it ('throws an error if not given function', function(done) {
      try {
        app.prepare(undefined)
      } catch(x) {
        done()
      }
    })
  })

  describe('Microcosm:push', function() {
    it ('sends a messages to the dispatcher', function() {
      sinon.spy(app, '_dispatch')
      app.push(Action)
      app._dispatch.should.have.been.calledWith(Action, true)
    })

    it ('can send async messages to the dispatcher', function(done) {
      let Async = () => Promise.resolve(true)

      sinon.spy(app, '_dispatch')

      app.push(Async).then(function() {
        app._dispatch.should.have.been.calledWith(Async, true)
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

  describe('Microcosm::_dispatch', function() {
    let local;

    beforeEach(function(done) {
      local = new Microcosm()
      local.addStore({ respond: () => true, toString: () => 'another-store' })
      local.start(done)
    })

    it ('does not emit a change if no handler responds', function() {
      local.listen(function() {
        throw Error("Expected app to not respond but did")
      })

      local._dispatch(Action)
    })

    it ('commits changes if a store can respond', function(done) {
      local.listen(done)
      local._dispatch('respond')
    })

  })

  describe('Microcosm::addPlugin', function() {
    it ('pushes a plugin into a list', function() {
      app.addPlugin({ register() {} })
      app._plugins.length.should.equal(1)
    })

    it ('throws an error if a register function is not provided', function(done) {
      try {
        app.addPlugin({ })
      } catch(x) {
        done()
      }
    })
  })

  describe('Microcosm::addStore', function() {
    it ('can add stores', function() {
      app._stores.should.have.property(DummyStore)
    })

    it ('throws an error of a stores toString is not unique', function(done) {
      app.addStore({ toString() { return 'fiz' } })

      try {
        app.addStore({ toString() { return 'fiz' } })
      } catch(x) {
        done()
      }
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
      app.addStore({
        getInitialState() {
          return 'this will not display'
        },
        serialize() {
          return 'this is a test'
        },
        toString() {
          return 'serialize-test'
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

  describe('Microcosm::toObject', function() {
    it ('can turn into a flat object', function() {
      app._commit(Object.create({ foo: 'bar' }))
      app.toObject().should.have.property('foo', 'bar')
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
