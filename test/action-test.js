import Action from '../src/action'
import assert from 'assert'

describe('Action', function() {
  const identity = n => n

  describe('Events', function() {

    it ('triggers an open event when it opens', function (done) {
      const action = new Action(identity)

      action.once('open', function (body) {
        assert.equal(body, 3)
        done()
      })

      action.open(3)
    })

    it ('triggers an update event when it sends', function (done) {
      const action = new Action(identity)

      action.once('update', function (body) {
        assert.equal(body, 3)
        done()
      })

      action.send(3)
    })

    it ('triggers a done event when it closes', function (done) {
      const action = new Action(identity)

      action.once('done', function (body) {
        assert.equal(body, 3)
        done()
      })

      action.close(3)
    })

    it ('triggers a error event when it is rejected', function (done) {
      const action = new Action(identity)

      action.once('error', function (reason) {
        assert.equal(reason, 404)
        done()
      })

      action.reject(404)
    })

    it ('triggers a cancel event when it is cancelled', function (done) {
      const action = new Action(identity)

      action.once('cancel', () => done())
      action.cancel()
    })

    it ('triggers a change event when it is toggled', function (done) {
      const action = new Action(identity)

      action.once('change', done)

      action.toggle()
    })
  })

  describe('Lifecycle', function() {
    context('when an action is created', function() {
      beforeEach(function() {
        this.action = new Action(identity)
      })

      it('tags the action', function() {
        assert.equal(identity.__tagged, true)
      })

      it ('starts unset', function() {
        assert.equal(this.action.is('unset'), true)
      })

      context('and it opens', function() {
        beforeEach(function() {
          this.action.open(true)
        })

        it ('sets the payload', function() {
          assert.equal(this.action.payload, true)
        })

        it ('enters an open state', function() {
          assert.equal(this.action.is('unset'), false)
          assert.equal(this.action.is('open'), true)
        })

        context('and then updates', function() {
          beforeEach(function() {
            this.action.send(1)
          })

          it ('updates the payload', function() {
            assert.equal(this.action.payload, 1)
          })

          it ('enters a loading state', function() {
            assert.equal(this.action.is('open'), false)
            assert.equal(this.action.is('loading'), true)
          })

          context('and then completes', function() {
            beforeEach(function() {
              this.action.close(2)
            })

            it ('updates the payload', function() {
              assert.equal(this.action.payload, 2)
            })

            it ('enters a complete state', function() {
              assert.equal(this.action.is('loading'), false)
              assert.equal(this.action.is('done'), true)
            })

            it ('is disposable', function() {
              assert.equal(this.action.is('disposable'), true)
            })
          })

          context('and then fails', function() {
            beforeEach(function() {
              this.action.reject(new Error('Bad input'))
            })

            it ('updates the payload with the error', function() {
              assert.equal(this.action.payload.message, 'Bad input')
            })

            it ('enters a failure state', function() {
              assert.equal(this.action.is('loading'), false)
              assert.equal(this.action.is('failed'), true)
            })

            it ('is disposable', function() {
              assert.equal(this.action.is('disposable'), true)
            })
          })

          context('when it is cancelled', function() {
            beforeEach(function() {
              this.action.cancel()
            })

            it ('enters a cancelled state', function() {
              assert.equal(this.action.is('cancelled'), true)
            })

            it ('identifies as disposable', function() {
              assert.equal(this.action.is('disposable'), true)
            })
          })

          context('when it is toggled', function() {
            beforeEach(function() {
              this.action.toggle()
            })

            it ('enters a disabled state', function() {
              assert.equal(this.action.is('disabled'), true)
            })
          })
        })
      })
    })
  })
})
