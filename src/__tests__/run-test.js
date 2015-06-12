import run from '../run'

describe('run', function() {
  it ('throws an error if callbacks are not functions', function(done) {
    try {
      run([ null ])
    } catch(x) {
      done()
    }
  })
})
