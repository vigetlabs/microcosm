import React  from 'react'
import DOM    from 'react-dom'
import Test   from 'react-addons-test-utils'
import Catch  from 'microcosm/addons/catch'
import Prompt from '../../app/views/prompt'
import assert from 'assert'

describe('Chatbot | Views | Prompt', function () {

  it ('sends a message', function (done) {
    function assertion (intent, params) {
      assert.equal(intent, 'sendChat')
      assert.equal(params.message, 'Hello')
      done()
    }

    const form = Test.renderIntoDocument(<Catch send={ assertion }><Prompt /></Catch>)
    const el   = DOM.findDOMNode(form)

    el.querySelector('#message').value = 'Hello'

    Test.Simulate.submit(el)
  })

})
