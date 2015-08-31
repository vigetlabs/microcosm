import Microcontroller from '../index'
import Microcosm from 'src/Microcosm'
import React from 'react/addons'

const { TestUtils } = React.addons

describe('Microcontroller', function() {
  let Sample, App, Action;

  beforeEach(function(done) {
    Action = n => n

    Sample = React.createClass({
      mixins: [ Microcontroller ],
      selections: {
        double : state => state.count * 2
      },
      render() {
        return <p>{ this.state.double }</p>
      }
    })

    App = new Microcosm()

    App.addStore('count', {
      getInitialState: () => 1,
      register() {
        return {
          [Action]: (state, n) => n
        }
      }
    }).start(done)
  })

  it ('computes properties on mount', function() {
    let component = TestUtils.renderIntoDocument(<Sample app={ App } />)

    component.state.double.should.equal(2)
  })

  it ('listens for changes', function() {
    let component = TestUtils.renderIntoDocument(<Sample app={ App } />)

    App.push(Action, 2, function() {
      component.state.double.should.equal(4)
    })
  })

  it ('does not re-render if computed properties did not change', function() {
    let component = TestUtils.renderIntoDocument(<Sample app={ App } />)

    sinon.spy(component, 'render')

    App.emit()

    component.render.should.not.have.beenCalled
  })

  it ('throws an error if selection is nully', function() {
    let component = TestUtils.renderIntoDocument(<Sample app={ App } />)

    component.selections = null

    App.emit.should.throw(/Sample expected selections/)
  })

})
