import React    from 'react'
import DOM      from 'react-dom'
import Test     from 'react-addons-test-utils'
import ListForm from '../../../../app/views/lists/parts/list-form'
import Catch    from '../../../helpers/catch'
import assert   from 'assert'

describe('ReactRouter | Views | ListForm', function () {

  it ('sends the correct form parameters when it submits', function (done) {
    function assertion (intent, params) {
      assert.equal(intent, 'addList')
      assert.equal(params.name, 'John Doe')
      done()
    }

    const form = Test.renderIntoDocument(<Catch send={ assertion }><ListForm /></Catch>)
    const el   = DOM.findDOMNode(form)

    el.querySelector('#list-name').value = 'John Doe'

    Test.Simulate.submit(el)
  })

})
