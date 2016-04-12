import Microcosm from '../src/Microcosm'
import assert from 'assert'

describe('When dispatching workflows', function() {
  const removeNotice  = 'removeNotice'
  const warningNotice = 'warningNotice'

  function warn (push, callback) {
	  return (text) => {
		  push(removeNotice, 'warning')
		  push(warningNotice, { id : 'warning', text }, callback)
	  }
  }

  beforeEach(function (done) {
    this.app = new Microcosm()

    this.app.addStore('notices', function () {
      return {
        getInitialState: [],

        [removeNotice](state, id) {
          return state.filter(note => note.id !== id)
        },

        [warningNotice](state, params) {
          return state.concat({ type: 'warning', ...params })
        }
      }
    })

    this.app.start(done)
  })

  it ('allows pushing of multiple actions', function() {
    let app = this.app

    app.workflow(warn, 'heyo!', function () {
      assert.equal(app.state.notices[0].text, 'heyo!')
    })

    app.workflow(warn, 'wut!', function () {
      assert.equal(app.state.notices.length, 1)
      assert.equal(app.state.notices[0].text, 'wut!')
    })
  })

})
