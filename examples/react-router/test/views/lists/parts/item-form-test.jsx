import React    from 'react'
import {mount}  from 'enzyme'
import ItemForm from '../../../../app/views/lists/parts/item-form'
import assert   from 'assert'

describe('ReactRouter | Views | ItemForm', function () {

  it ('sends the correct form parameters when it submits', function (done) {
    function assertion (intent, params) {
      assert.equal(intent, 'addItem')
      assert.equal(params.name, 'Eggs')
      assert.equal(params.list, 2)
      done()
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

})
