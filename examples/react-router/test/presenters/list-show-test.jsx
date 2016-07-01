import React    from 'react'
import Todos    from '../../app/todos'
import Test     from 'react-addons-test-utils'
import ListShow from '../../app/presenters/list-show'
import assert   from 'assert'

describe('Presenters | ListShow', function() {
  beforeEach(function() {
    this.presenter = Test.renderIntoDocument(
      <ListShow app={ new Todos() } params={{ id: 2 } } />
    )
  })

  context('when sent an addItem message', function() {
    beforeEach(function() {
      this.presenter.send('addItem', { list: 2, name: 'Test' })
    })

    it ('should create a list item', function() {
      assert.equal(this.presenter.state.items.length, 1)
    })

    context('and when sent a removeItem message', function() {
      beforeEach(function() {
        this.presenter.send('removeItem', this.presenter.state.items[0])
      })

      it ('should create a list item', function() {
        assert.equal(this.presenter.state.items.length, 0)
      })
    })
  })
})
