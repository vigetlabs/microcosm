import Action     from './fixtures/Action'
import DummyStore from './fixtures/DummyStore'
import Microcosm  from '../Microcosm'

describe('Microcosm', function() {

  it ('can add stores', function() {
    let m = new Microcosm()

    m.addStore(DummyStore)

    m._stores.should.have.property(DummyStore)
  })

  it ('pulls default state for a store if it has not been assigned', function(done) {
    let m = new Microcosm()

    m.addStore(DummyStore)

    m.start(function() {
      m.pull(DummyStore).should.equal(DummyStore.getInitialState())
    }, done)
  })

  it ('can serialize to JSON', function(done) {
    let m = new Microcosm()

    m.addStore(DummyStore)

    m.start(function() {
      m.toJSON().should.have.property('dummy', 'test')
      done()
    })
  })

  it ('runs through serialize methods on stores', function(done) {
    let m = new Microcosm()

    m.addStore({
      getInitialState() {
        return 'this will not display'
      },
      serialize(state) {
        state.should.equal(this.getInitialState())
        return 'this is a test'
      },
      toString() {
        return 'serialize-test'
      }
    })

    m.start(function() {
      m.toJSON().should.have.property('serialize-test', 'this is a test')
      done()
    })
  })

  it ('can push data into stores', function() {
    let mixture = { fiz: 'buz' }
    let m       = new Microcosm()

    m.addStore(DummyStore)
    m.push({ dummy: mixture })
    m.pull(DummyStore).should.equal(mixture)
  })

  it ('can send sync messages to the dispatcher', function() {
    let m = new Microcosm()

    sinon.spy(m, 'dispatch')

    m.send(Action)
    m.dispatch.should.have.been.calledWith(Action, true)
  })

  it ('can send async messages to the dispatcher', function(done) {
    let m = new Microcosm()
    let Async = () => Promise.resolve(true)

    sinon.spy(m, 'dispatch')

    m.send(Async).then(function() {
      m.dispatch.should.have.been.calledWith(Async, true)
      done()
    })
  })

  it('can respond to actions', function(done) {
    let m   = new Microcosm()
    let spy = sinon.spy(DummyStore, Action.toString())

    m.addStore(DummyStore)

    m.send(Action)
    spy.should.have.been.called
    spy.restore()
    done()
  })

  it ('does not emit a change if no handler responds', function() {
    let m = new Microcosm()

    m.addStore({ toString: () => 'another-store' })

    m.listen(function() {
      throw Error("Expected app to not respond but did")
    })

    m.send(Action)
  })

  it ('can partially apply actions', function() {
    let m   = new Microcosm()
    let add = (a=0, b=0) => a + b

    m.prepare(add)(2, 3).should.equal(5)
    m.prepare(add, 4)(1).should.equal(5)
    m.prepare(add)(1).should.equal(1)
  })

  it ('throws an error of a stores toString is not unique', function(done) {
    let m   = new Microcosm()
    m.addStore({ toString() { return 'fiz' } })

    try {
      m.addStore({ toString() { return 'fiz' } })
    } catch(x) {
      done()
    }
  })

  it ('can handle undefined arguments in deserialize', function() {
    let m = new Microcosm()

    m.addStore({ toString() { return 'fiz' } })

    m.deserialize()
  })


  it ('can turn into a flat object', function() {
    let m = new Microcosm()

    m.commit(Object.create({ foo: 'bar' }))

    m.toObject().should.have.property('foo', 'bar')
  })


})
