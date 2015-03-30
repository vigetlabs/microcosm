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
      app.send(ListActions.add, { name })
    })

    it ('should create a new list with the proper name', function() {
      app.get(Lists)[0].should.have.property('name', name)
    })

  })

  describe('when sent a ListActions.remove message', function() {
    var name = 'My todo list'

    beforeEach(function() {
      app.send(ListActions.add, { name })
      app.send(ListActions.remove, app.get(Lists)[0].id)
    })

    it ('should remove the list by id', function() {
      app.get(Lists).length.should.equal(0)
    })

  })

  describe('when sent a ItemActions.add message', function() {
    var name = 'My task'

    beforeEach(function() {
      app.send(ListActions.add, { name: 'parent' })
      app.send(ItemActions.add, { name, list: app.get(Lists)[0] })
    })

    it ('should create a new item with the proper name', function() {
      app.get(Items)[0].should.have.property('name', name)
    })

  })

  describe('when sent a ItemActions.remove message', function() {
    var name = 'My task'

    beforeEach(function() {
      app.send(ListActions.add, { name: 'parent' })
      app.send(ItemActions.add, { name, list: app.get(Lists)[0] })
      app.send(ItemActions.remove, app.get(Items)[0].id)
    })

    it ('remove the item by id', function() {
      app.get(Items).length.should.equal(0)
    })

  })

  describe('when sent a ListActions.remove message with items', function() {
    var name = 'My task'

    beforeEach(function() {
      app.send(ListActions.add, { name: 'parent' })
      app.send(ItemActions.add, { name, list: app.get(Lists)[0] })
      app.send(ListActions.remove, app.get(Lists)[0].id)
    })

    it ('removes all child items', function() {
      app.get(Items).length.should.equal(0)
    })

  })

  describe('when sent a RouteActions.set message', function() {
    var params = { pathname: 'my/route' }

    beforeEach(function() {
      app.send(RouteActions.set, params)
    })

    it ('simply updates the state with the provided parameters', function() {
      app.get(Route).should.eql(params)
    })

  })

})
