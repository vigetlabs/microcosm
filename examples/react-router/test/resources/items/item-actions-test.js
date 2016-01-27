import App from '../../../app/todos'
import assert from 'assert'
import { addItem, removeItem } from '../../../app/resources/items/actions'
import { addList, removeList } from '../../../app/resources/lists/actions'

describe('Item Actions', function() {
  var app;

  beforeEach(function(done) {
    app = new App()
    app.start(done)
  })

  describe('when sent a addItem message', function() {
    var name = 'My task'

    beforeEach(function() {
      app.push(addList, { name: 'parent' })
      app.push(addItem, [app.state.lists[0].id, { name }])
    })

    it ('should create a new item with the proper name', function() {
      assert.equal(app.state.items[0].name, name)
    })

  })

  describe('when sent a removeItem message', function() {
    var name = 'My task'

    beforeEach(function() {
      app.push(addList, { name: 'parent' })
      app.push(addItem, [ app.state.lists[0].id, { name } ])
      app.push(removeItem, app.state.items[0].id)
    })

    it ('remove the item by id', function() {
      assert.equal(app.state.items, 0)
    })

  })

})
