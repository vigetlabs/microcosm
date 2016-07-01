import React   from 'react'
import DOM     from 'react-dom'
import Test    from 'react-addons-test-utils'
import Destroy from '../../../../app/views/lists/parts/destroy'
import Catch   from '../../../helpers/catch'
import assert  from 'assert'

describe('Destroy', function () {

  it ('sends the correct form parameters when it submits', function (done) {
    function assertion (intent, params) {
      assert.equal(intent, 'destroy')
      assert.equal(params.id, "3")
      done()
    }

    const form = Test.renderIntoDocument(
      <Catch send={ assertion }>
        <Destroy intent="destroy" id="3" />
      </Catch>
    )

    Test.Simulate.submit(DOM.findDOMNode(form))
  })

})
