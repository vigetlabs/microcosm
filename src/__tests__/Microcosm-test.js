import Microcosm from '../Microcosm'
import Store     from '../Store'

describe('Microcosm', function() {
  let DummyActions = {
    create() {}
  }

  class DummyStore extends Store {
    getInitialState(seed) {
      return seed
    }

    serialize() {
      return { foo: 'bar' }
    }
  }

  it ('creates a new dispatcher for ever instantiation', function() {
    (new Microcosm)._dispatcher.should.not.equal((new Microcosm)._dispatcher)
  })

  it ('can add actions', function() {
    let m = new Microcosm()

    m.addActions({
      test: DummyActions
    })

    m.actions.should.have.property('test')
  })

  it ('add stores', function() {
    let m = new Microcosm()

    m.addStores({
      test: DummyStore
    })

    m.stores.should.have.property('test')
  })

  it ('can dispatch', function() {
    let m = new Microcosm()

    m.addStores({
      test: DummyStore
    })

    var spy = sinon.spy(m.stores.test, 'send')

    m._dispatcher.dispatch({ type: 'test_create', body: 'test' })

    spy.should.have.been.calledWith({ type: 'test_create', body: 'test' })
  })


  it ('can serialize', function() {
    let m = new Microcosm()

    m.addStores({
      other : Store,
      test  : DummyStore
    })

    m.serialize().should.have.property('test', m.stores.test.state)
  })

  it ('passes seed data to stores', function() {
    let seed = { fiz: 'buz' }
    let m    = new Microcosm({ test: seed })

    m.addStores({
      test: DummyStore
    })

    m.stores.test.state.should.equal(seed)
  })

})
