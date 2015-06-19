let React = require('react/addons')
let Microscope = require('../index')
let Microcosm = require('../../../src/Microcosm')
let render = React.addons.TestUtils.renderIntoDocument

describe('<Microscope />', function() {
  let test = function test() {}
  let app;

  beforeEach(function(done) {
    app = new Microcosm()
    app.addStore('key', {
      register() {
        return {
          [test]: state => 'value'
        }
      }
    })
    app.start(done)
  })

  it ('keeps up to date with an instance', function(done) {
    let el = render(<Microscope instance={ app }><p /></Microscope>)

    app.push(test)

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
