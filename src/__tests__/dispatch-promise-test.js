let Microcosm  = require('../Microcosm')

describe('When dispatching promises', function() {
  let single = function(n) {
    return Promise.resolve(n)
  }
  let chain  = n => Promise.resolve(n).then(n => Promise.resolve(n))
  let error  = function(n) {
    return new Promise(function (resolve, reject) {
      setTimeout(_ => reject('Purposeful error'), 50)
    })
  }
  let app;

  let TestStore = {
    getInitialState: () => 1,
    register() {
      return {
        [single] : (a, b) => b,
        [chain]  : (a, b) => b,
        [error]  : (a, b) => b
      }
    }
  }

  beforeEach(function(done) {
    app = new Microcosm()
    app.addStore('test', TestStore)
    app.start(done)
  })

  it ('waits for the promise to resolve', function(done) {
    app.listen(function() {
      app.get('test').should.equal(2)
      done()
    }).push(single, 2)
  })

  it ('does not dispatch if the promise fails', function(done) {
    sinon.spy(app, 'dispatch')

    app.push(error).then(null, function() {
      app.dispatch.should.not.have.been.called
      done()
    })
  })

  it ('waits for all promises in the chain to resolve', function(done) {
    app.push(chain, 1).then(function() {
      app.get('test').should.equal(1)
      done()
    })
  })

  it ('respects future changes when it fails', function(done) {
    app.push(error, 1).catch(function() {
      app.get('test').should.equal(4)
      app.get('random_key').should.equal('fiz')
      done()
    })

    app.set('random_key', 'fiz')
    app.push(single, 4)
  })
})
