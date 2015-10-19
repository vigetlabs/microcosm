let Microcosm = require('../src/Microcosm')
let Promise   = require('promise')
let assert    = require('assert')

describe('When dispatching promises', function() {
  let pass = function(n) {
    return n
  }
  let single = function(n) {
    return Promise.resolve(n)
  }
  let chain  = n => Promise.resolve(n).then(n => Promise.resolve(n))
  let error  = function(n) {
    return new Promise(function (resolve, reject) {
      setTimeout(reject, 100)
    })
  }
  let late = function(n) {
    return new Promise(function (resolve, reject) {
      setTimeout(_ => resolve(n), 50)
    })
  }

  let throws = function(n) {
    return new Promise(function() {
      (this-will-fail-because-of-a-syntax-error)
    })
  }

  let app;

  let TestStore = {
    getInitialState: () => 1,
    register() {
      return {
        [single] : this.sum,
        [chain]  : this.sum,
        [error]  : this.error,
        [late]   : this.sum,
        [pass]   : this.sum
      }
    },

    error() {
      throw new Error("TestStore.error should have never been called")
    },

    sum(a, b) {
      return a + b
    }
  }

  beforeEach(function(done) {
    app = new Microcosm()
    app.addStore('test', TestStore)
    app.start(done)
  })

  it ('returns the promise from app.push', function(done) {
    app.push(single, 2).done(function() {
      assert.equal(app.state.test, 3)
      done()
    })
  })

  it ('does not alter state if the promise fails', function(done) {
    app.push(error, []).nodeify(function(error) {
      assert.equal(app.state.test, app.getInitialState().test)
      done(error)
    })
  })

  it ('waits for all promises in the chain to resolve', function(done) {
    app.push(chain, 1, function() {
      assert.equal(app.state.test, 2)
      done()
    })
  })

  it ('respects future changes when it fails', function(done) {
    app.push(error, 1).nodeify(function(error) {
      assert.equal(app.state.test, 5, 'State was not the result of 5 + 1')
      done(error)
    })

    app.push(single, 4)
  })

  it ('does not dispatch transactions for unresolved promises', function(done) {
    app.push(late, 1, function(error) {
      assert.equal(app.state.test, 6, 'should have been: 1 + 4 + 1 = 6')
      done(error)
    })

    app.push(pass, 4)
    assert.equal(app.state.test, 5, 'should have been: 1 + 4 = 5')
  })

  it ('handles errors thrown by promises', function(done) {
    app.push(throws, 1, function(error) {
      assert(error instanceof ReferenceError)
      done()
    })
  })
})
