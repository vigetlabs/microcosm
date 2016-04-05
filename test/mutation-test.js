import Microcosm from '../src/Microcosm'
import assert from 'assert'

describe('Mutation', function() {

  context('when a store writes mutatively', function() {
    let action = function() {}

    beforeEach(function(done) {
      this.app = new Microcosm()

      this.app.addStore(function() {
        return {
          getInitialState() {
            return { test: false }
          },
          [action](state) {
            state.test = true
            return state
          }
        }
      })

      this.app.start(done)
    })


    it ('it writes to application state', function (done) {
      this.app.push(action, true, error => {
        assert.equal(this.app.state.test, true)
        done(error)
      })
    })
  })

})
