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
      app.pull(Lists)[0].should.have.property('name', name)
    })

  })

  describe('when sent a ListActions.remove message', function() {
    var name = 'My todo list'

    beforeEach(function() {
      app.push(ListActions.add, { name })
      app.push(ListActions.remove, app.pull(Lists)[0].id)
    })

    it ('should remove the list by id', function() {
      app.pull(Lists).length.should.equal(0)
    })

  })

  describe('when sent a ItemActions.add message', function() {
    var name = 'My task'

    beforeEach(function() {
      app.push(ListActions.add, { name: 'parent' })
      app.push(ItemActions.add, { name, list: app.pull(Lists)[0] })
    })

    it ('should create a new item with the proper name', function() {
      app.pull(Items)[0].should.have.property('name', name)
    })

  })

  describe('when sent a ItemActions.remove message', function() {
    var name = 'My task'

    beforeEach(function() {
      app.push(ListActions.add, { name: 'parent' })
      app.push(ItemActions.add, { name, list: app.pull(Lists)[0] })
      app.push(ItemActions.remove, app.pull(Items)[0].id)
    })

    it ('remove the item by id', function() {
      app.pull(Items).length.should.equal(0)
    })

  })

  describe('when sent a ListActions.remove message with items', function() {
    var name = 'My task'

    beforeEach(function() {
      app.push(ListActions.add, { name: 'parent' })
      app.push(ItemActions.add, { name, list: app.pull(Lists)[0] })
      app.push(ListActions.remove, app.pull(Lists)[0].id)
    })

    it ('removes all child items', function() {
      app.pull(Items).length.should.equal(0)
    })

  })

  describe('when sent a RouteActions.set message', function() {
    var params = { pathname: 'my/route' }

    beforeEach(function() {
      app.push(RouteActions.set, params)
    })

    it ('simply updates the state with the provided parameters', function() {
      app.pull(Route).should.eql(params)
    })

  })

})
