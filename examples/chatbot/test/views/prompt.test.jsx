import test from 'ava'
import React from 'react'
import Prompt from '../../app/views/prompt'
import {mount} from 'enzyme'

test.cb('sends a message', t => {
  function assertion (intent, params) {
    t.is(intent, 'sendChat')
    t.is(params.message, 'Hello')
    t.end()
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
