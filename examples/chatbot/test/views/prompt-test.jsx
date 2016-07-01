import React   from 'react'
import {mount} from 'enzyme'
import Prompt  from '../../app/views/prompt'
import assert  from 'assert'

describe('Chatbot | Views | Prompt', function () {

  it ('sends a message', function (done) {
    function assertion (intent, params) {
      assert.equal(intent, 'sendChat')
      assert.equal(params.message, 'Hello')
      done()
    }

    const form = mount(<Prompt />, {
      context: {
        send : assertion
      },
      childContextTypes: {
        send : React.PropTypes.func
      }
    })

    form.find('[name="message"]').simulate('change', { target: { value: 'Hello' } })

    form.simulate('submit')
  })

})
