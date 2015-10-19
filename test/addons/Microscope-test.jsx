let React = require('react/addons')
let Microscope = require('../../src/addons/microscope')
let Microcosm = require('../../../Microcosm')
let render = React.addons.TestUtils.renderIntoDocument
let assert = require('assert')

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
      assert.equal(el.state.key, 'value')
      done()
    }, 100)
  })

  it ('does not wrap single children', function() {
    let el = render(<Microscope instance={ app }><p/></Microscope>)

    assert.equal(el.getDOMNode().tagName, 'P')
  })

  it ('wraps multiple children in a span', function() {
    let el = render(<Microscope instance={ app }><p/><p/></Microscope>)

    assert.equal(el.getDOMNode().tagName, 'SPAN')
  })

  it ('unsubscribes when unmounting', function() {

    React.render(<Microscope instance={ app }><p/><p/></Microscope>, document.body)
    React.render(<div />, document.body)

    app.emit()
  })

})
