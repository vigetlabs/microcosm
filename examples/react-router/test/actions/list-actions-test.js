import App         from '../../app/todos'
import ItemActions from '../../app/actions/items'
import ListActions from '../../app/actions/lists'
import assert from 'assert'

describe('List Actions', function() {
  var app;

  beforeEach(function(done) {
    app = new App()
    app.start(done)
  })

  describe('when sent a ListActions.add message', function() {
    var name = 'My todo list'

    beforeEach(function() {
      app.push(ListActions.add, { name })
    })

    it ('should create a new list with the proper name', function() {
      assert.equal(app.state.lists[0].name, name)
    })

  })

  describe('when sent a ListActions.remove message', function() {
    var name = 'My todo list'

    beforeEach(function() {
      app.push(ListActions.add, { name })
      app.push(ListActions.remove, app.state.lists[0].id)
    })

    it ('should remove the list by id', function() {
      assert.equal(app.state.lists.length, 0)
    })

  })

  describe('when sent a ListActions.remove message with items', function() {
    var name = 'My task'

    beforeEach(function() {
      app.push(ListActions.add, { name: 'parent' })
      app.push(ItemActions.add, [ app.state.lists[0].id, { name } ])
      app.push(ListActions.remove, app.state.lists[0].id)
    })

    it ('removes all child items', function() {
      assert.equal(app.state.items.length, 0)
    })

  })
})
