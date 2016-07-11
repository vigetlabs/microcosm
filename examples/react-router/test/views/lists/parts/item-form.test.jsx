import test from 'ava'
import React from 'react'
import ItemForm from '../../../../app/views/lists/parts/item-form'
import {mount} from 'enzyme'

test('sends the correct form parameters when it submits', t => {
  t.plan(2)

  function assertion (intent, params) {
    t.is(intent, 'addItem')
    t.deepEqual(params, { name: 'Eggs', list: '2' })
  }

  const form = mount(<ItemForm list="2" />, {
    context: {
      send : assertion
    },
    childContextTypes: {
      send : React.PropTypes.func
    }
  })

  form.find('[name="name"]').simulate('change', { target: { value: 'Eggs' } })

  form.simulate('submit')
})
