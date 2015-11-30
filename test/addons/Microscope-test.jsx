import DOM        from 'react-dom'
import Microcosm  from '../../src/Microcosm'
import Microscope from '../../src/addons/microscope'
import React      from 'react'
import assert     from 'assert'
import TestUtils  from 'react-addons-test-utils'

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
    let el = TestUtils.renderIntoDocument(<Microscope instance={ app }><p /></Microscope>)

    app.push(test)

    setTimeout(function() {
      assert.equal(el.state.key, 'value')
      done()
    }, 100)
  })

  it ('does not wrap single children', function() {
    let el = TestUtils.renderIntoDocument(<Microscope instance={ app }><p/></Microscope>)

    assert.equal(DOM.findDOMNode(el).tagName, 'P')
  })

  it ('wraps multiple children in a span', function() {
    let el = TestUtils.renderIntoDocument(<Microscope instance={ app }><p/><p/></Microscope>)

    assert.equal(DOM.findDOMNode(el).tagName, 'SPAN')
  })

  it ('unsubscribes when unmounting', function() {
    var body = document.createElement("div")

    DOM.render(<Microscope instance={ app }><p/><p/></Microscope>, body)
    DOM.render(<div />, body)

    app.emit()
  })

})
