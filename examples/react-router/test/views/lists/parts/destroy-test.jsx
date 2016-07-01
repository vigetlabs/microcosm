import React   from 'react'
import {mount}  from 'enzyme'
import Destroy from '../../../../app/views/lists/parts/destroy'
import assert  from 'assert'

describe('ReactRouter | Views | Destroy', function () {

  it ('sends the correct form parameters when it submits', function (done) {
    function assertion (intent, params) {
      assert.equal(intent, 'destroy')
      assert.equal(params.id, "3")
      done()
    }

    const form = mount(<Destroy intent="destroy" id="3" />, {
      context : { send: assertion },
      childContextTypes: {
        send : React.PropTypes.func
      }
    })

    form.simulate('submit')
  })

})
