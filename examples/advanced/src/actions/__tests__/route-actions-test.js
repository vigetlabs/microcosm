import App          from '../../App'
import RouteActions from '../route'

describe('Route Actions', function() {
  var app;

  beforeEach(function(done) {
    app = new App()
    app.start(done)
  })

  describe('when sent a RouteActions.set message', function() {
    it ('simply updates the state with the provided parameters', function() {
      var params = { params: 'my/route' }

      app.push(RouteActions.set, params)

      app.get('route').should.eql(params)
    })
  })
})
