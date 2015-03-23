import Action     from './fixtures/Action'
import DummyStore from './fixtures/DummyStore'
import Microcosm  from '../Microcosm'

describe('Microcosm', function() {

  it ('add stores', function() {
    let m = new Microcosm()

    m.addStore(DummyStore)

    m.has(DummyStore).should.equal(true)
  })

  it ('gets default state for a store if it has not been assigned', function() {
    let m = new Microcosm()

    m.addStore(DummyStore)

    m.get(DummyStore).should.equal(DummyStore.getInitialState())
  })

  it ('can serialize', function() {
    let m = new Microcosm()

    m.addStore(DummyStore)
    m.toJSON().should.have.property('dummy', 'test')
  })

  it ('passes seed data to stores', function() {
    let seed = { fiz: 'buz' }
    let m    = new Microcosm()

    m.addStore(DummyStore)

    m.seed({ dummy: seed })

    m.get(DummyStore).should.equal(seed)
  })

  it ('can assign new state', function() {
    let seed = { fiz: 'buz' }
    let m    = new Microcosm({ dummy: seed })

    m.addStore(DummyStore)

    m.set(DummyStore, { fiz: 'not-buz'})

    m.get(DummyStore).fiz.should.equal('not-buz')
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
    let m = new Microcosm()

    m.addStore(DummyStore)

    let spy = sinon.spy(DummyStore, Action.toString())

    m.send(Action)
    spy.should.have.been.called
    spy.restore()
    done()
  })

  it('can handle actions without store responses', function() {
    let m = new Microcosm()

    m.addStore({ toString:() => 'another-store' })
    m.send(Action)
  })

})
