import test from 'ava'
import React from 'react'
import Destroy from '../../../../app/views/lists/parts/destroy'
import {mount}  from 'enzyme'

test('sends the correct form parameters when it submits', t => {
  t.plan(2)

  function assertion (intent, params) {
    t.is(intent, 'destroy')
    t.is(params.id, "3")
  }

  const form = mount(<Destroy intent="destroy" id="3" />, {
    context : { send: assertion },
    childContextTypes: {
      send : React.PropTypes.func
    }
  })

  form.simulate('submit')
})
