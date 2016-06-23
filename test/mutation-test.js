import Microcosm from '../src/Microcosm'
import assert from 'assert'

describe('Mutation', function() {

  context('when a store writes mutatively', function() {
    let action = function() {}

    beforeEach(function() {
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
    })

    it ('writes to application state', function (done) {
      this.app.push(action, true).onDone(() => {
        assert.equal(this.app.state.test, true)
        done()
      })
    })
  })

})
