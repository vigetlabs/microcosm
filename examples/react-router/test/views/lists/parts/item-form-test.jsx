import React    from 'react'
import DOM      from 'react-dom'
import Test     from 'react-addons-test-utils'
import ItemForm from '../../../../app/views/lists/parts/item-form'
import Catch    from '../../../helpers/catch'
import assert   from 'assert'

describe('ReactRouter | Views | ItemForm', function () {

  it ('sends the correct form parameters when it submits', function (done) {
    function assertion (intent, params) {
      assert.equal(intent, 'addItem')
      assert.equal(params.name, 'John Doe')
      done()
    }

    const form = Test.renderIntoDocument(<Catch send={ assertion }><ItemForm /></Catch>)
    const el   = DOM.findDOMNode(form)

    el.querySelector('#item-name').value = 'John Doe'

    Test.Simulate.submit(el)
  })

})
