import App         from '../../todos'
import ItemActions from '../items'
import ListActions from '../lists'
import assert      from 'assert'

describe('Item Actions', function() {
  var app;

  beforeEach(function(done) {
    app = new App()
    app.start(done)
  })

  describe('when sent a ItemActions.add message', function() {
    var name = 'My task'

    beforeEach(function() {
      app.push(ListActions.add, { name: 'parent' })
      app.push(ItemActions.add, [app.state.lists[0].id, { name }])
    })

    it ('should create a new item with the proper name', function() {
      assert.equal(app.state.items[0].name, name)
    })

  })

  describe('when sent a ItemActions.remove message', function() {
    var name = 'My task'

    beforeEach(function() {
      app.push(ListActions.add, { name: 'parent' })
      app.push(ItemActions.add, [ app.state.lists[0].id, { name } ])
      app.push(ItemActions.remove, app.state.items[0].id)
    })

    it ('remove the item by id', function() {
      assert.equal(app.state.items, 0)
    })

  })

})
