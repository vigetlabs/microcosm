import React     from 'react'
import Todos     from '../../app/todos'
import Test      from 'react-addons-test-utils'
import ListIndex from '../../app/presenters/list-index'
import assert    from 'assert'

describe('Presenters | ListIndex', function() {
  beforeEach(function() {
    this.presenter = Test.renderIntoDocument(<ListIndex app={ new Todos() } />)
  })

  context('when sent an addList message', function() {
    beforeEach(function() {
      this.presenter.send('addList', { name: 'Test' })
    })

    it ('should create a list item', function() {
      assert.equal(this.presenter.state.lists.length, 1)
    })

    context('and when sent a removeList message', function() {
      beforeEach(function() {
        this.presenter.send('removeList', { id: this.presenter.state.lists[0].id })
      })

      it ('should create a list item', function() {
        assert.equal(this.presenter.state.lists.length, 0)
      })
    })
  })
})
