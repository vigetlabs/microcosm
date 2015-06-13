let React = require('react/addons')
let Microscope = require('../Microscope')
let Microcosm = require('../Microcosm')
let render = React.addons.TestUtils.renderIntoDocument

describe('<Microscope />', function() {
  let app;

  beforeEach(function(done) {
    app = new Microcosm()
    app.start(done)
  })

  it ('keeps up to date with an instance', function(done) {
    let el = render(<Microscope instance={ app }><p /></Microscope>)

    app.set('key', 'value')

    setTimeout(function() {
      el.state.key.should.equal('value')
      done()
    }, 100)
  })

  it ('does not wrap single children', function() {
    let el = render(<Microscope instance={ app }><p/></Microscope>)

    el.getDOMNode().tagName.should.equal('P')
  })

  it ('wraps multiple children in a span', function() {
    let el = render(<Microscope instance={ app }><p/><p/></Microscope>)

    el.getDOMNode().tagName.should.equal('SPAN')
  })

  it ('unsubscribes when unmounting', function() {
    sinon.spy(app, 'ignore')

    React.render(<Microscope instance={ app }><p/><p/></Microscope>, document.body)
    React.render(<div />, document.body)

    app.ignore.should.have.been.called
  })

})
