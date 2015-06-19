import App         from '../../App'
import ItemActions from '../items'
import ListActions from '../lists'

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
      app.push(ItemActions.add, { name, list: app.state.lists[0].id })
    })

    it ('should create a new item with the proper name', function() {
      app.state.items[0].name.should.equal(name)
    })

  })

  describe('when sent a ItemActions.remove message', function() {
    var name = 'My task'

    beforeEach(function() {
      app.push(ListActions.add, { name: 'parent' })
      app.push(ItemActions.add, { name, list: app.state.lists[0].id })
      app.push(ItemActions.remove, app.state.items[0].id)
    })

    it ('remove the item by id', function() {
      app.state.items.length.should.equal(0)
    })

  })

})
