import React    from 'react'
import {mount}  from 'enzyme'
import ListForm from '../../../../app/views/lists/parts/list-form'
import assert   from 'assert'

describe('ReactRouter | Views | ListForm', function () {

  it ('sends the correct form parameters when it submits', function (done) {
    function assertion (intent, params) {
      assert.equal(intent, 'addList')
      assert.deepEqual(params, { name: 'Groceries' })
      done()
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

})
