import test from 'ava'
import React from 'react'
import ListForm from '../../../../app/views/lists/parts/list-form'
import {mount} from 'enzyme'

test('sends the correct form parameters when it submits', t => {
  t.plan(2)

  function assertion (intent, params) {
    t.is(intent, 'addList')
    t.deepEqual(params, { name: 'Groceries' })
  }

  const form = mount(<ListForm />, {
    context: {
      send : assertion
    },
    childContextTypes: {
      send : React.PropTypes.func
    }
  })

  form.find('[name="name"]').simulate('change', { target: { value: 'Groceries' } })

  form.simulate('submit')
})
