import App from '../../../app/todos'
import assert from 'assert'
import {addItem, removeItem} from '../../../app/resources/items/actions'
import {addList, removeList} from '../../../app/resources/lists/actions'

describe('List Actions', function() {
  var app;

  beforeEach(function() {
    app = new App()
  })

  describe('when sent a ListActions.add message', function() {
    var name = 'My todo list'

    beforeEach(function() {
      app.push(addList, { name })
    })

    it ('should create a new list with the proper name', function() {
      assert.equal(app.state.lists[0].name, name)
    })

  })

  describe('when sent a removeList message', function() {
    var name = 'My todo list'

    beforeEach(function() {
      app.push(addList, { name })
      app.push(removeList, app.state.lists[0].id)
    })

    it ('should remove the list by id', function() {
      assert.equal(app.state.lists.length, 0)
    })

  })

  describe('when sent a removeList message with items', function() {
    var name = 'My task'

    beforeEach(function() {
      app.push(addList, { name: 'parent' })
      app.push(addItem, app.state.lists[0].id, { name })
      app.push(removeList, app.state.lists[0].id)
    })

    it ('removes all child items', function() {
      assert.equal(app.state.items.length, 0)
    })

  })
})
