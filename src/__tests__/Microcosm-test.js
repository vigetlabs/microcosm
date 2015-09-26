let Action      = require('./fixtures/Action')
let DummyStore  = require('./fixtures/DummyStore')
let Microcosm   = require('../Microcosm')
let Transaction = require('../Transaction')
let assert      = require('assert')

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

    assert.ok(new Map(new MyApp().stores).has('foo'))
  })

  describe('reset', function() {
    let dummy = Transaction('test')
    let transactions = [ dummy ]

    it ('copies the array when given transactions on reset', function() {
      assert.notEqual(app.reset({}, transactions).transactions, transactions)
    })
  })

  it ('getInitialState collects starting state for all registered stores', function() {
    let state = app.getInitialState()

    new Map(app.stores).forEach(function(store, key) {
      assert.equal(state[key], store.getInitialState())
    })
  })

  it ('deserializes when replace is invoked', function() {
    app.listen(function() {
      assert.equal(app.state.dummy, 'DIFFERENT')
    })

    app.replace({ dummy: 'different' })
  })

  it ('binds arguments to push', function() {
    app.prepare(function(...args) {
      assert.deepEqual(args, [ 1, 2, 3 ])
    }, [ 1, 2 ])(3)
  })

  it ('prepare handles cases with no arguments', function() {
    let expected = 3
    let test = a => assert.equal(a, expected)

    app.prepare(test)(expected)
  })

  it ('throws an error if asked to push a non-function value', function(done) {
    try {
      app.push(null)
    } catch(x) {
      assert(x instanceof TypeError)
      done()
    }
  })

  it ('throws an error if a non-string key is given in addStore', function(done) {
    try {
      new Microcosm().addStore({})
    } catch(x) {
      assert(x instanceof TypeError)
      done()
    }
  })

  it ('throws an error if missing a store', function(done) {
    try {
      new Microcosm().addStore('foo')
    } catch(x) {
      assert(x instanceof TypeError)
      done()
    }
  })

  it ('can run multiple callbacks', function(done) {
    let app = new Microcosm()

    app.start(() => {}, done)
  })
})
