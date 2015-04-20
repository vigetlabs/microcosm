import App          from '../App'
import ItemActions  from '../actions/items'
import Items        from '../stores/Items'
import ListActions  from '../actions/lists'
import Lists        from '../stores/Lists'
import RouteActions from '../actions/route'
import Route        from '../stores/Route'

describe('App', function() {
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
      app.refine('lists').first().should.have.property('name', name)
    })

  })

  describe('when sent a ListActions.remove message', function() {
    var name = 'My todo list'

    beforeEach(function() {
      app.push(ListActions.add, { name })
      app.push(ListActions.remove, app.refine('lists').first().id)
    })

    it ('should remove the list by id', function() {
      app.refine('lists').size().should.equal(0)
    })

  })

  describe('when sent a ItemActions.add message', function() {
    var name = 'My task'

    beforeEach(function() {
      app.push(ListActions.add, { name: 'parent' })
      app.push(ItemActions.add, { name, list: app.refine('lists').first() })
    })

    it ('should create a new item with the proper name', function() {
      app.refine('items').first().should.have.property('name', name)
    })

  })

  describe('when sent a ItemActions.remove message', function() {
    var name = 'My task'

    beforeEach(function() {
      app.push(ListActions.add, { name: 'parent' })
      app.push(ItemActions.add, { name, list: app.refine('lists').first() })
      app.push(ItemActions.remove, app.refine('items').first().id)
    })

    it ('remove the item by id', function() {
      app.refine('items').size().should.equal(0)
    })

  })

  describe('when sent a ListActions.remove message with items', function() {
    var name = 'My task'

    beforeEach(function() {
      app.push(ListActions.add, { name: 'parent' })
      app.push(ItemActions.add, { name, list: app.refine('lists').first() })
      app.push(ListActions.remove, app.refine('lists').first().id)
    })

    it ('removes all child items', function() {
      app.refine('items').size().should.equal(0)
    })

  })

  describe('when sent a RouteActions.set message', function() {

    it ('simply updates the state with the provided parameters', function() {
      var params = { params: 'my/route' }

      app.push(RouteActions.set, params)

      app.refine('route').valueOf().should.eql(params)
    })

  })

})
