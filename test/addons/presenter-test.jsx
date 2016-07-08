import React from 'react'
import Microcosm from '../../src/microcosm'
import Presenter from '../../src/addons/presenter'
import assert from 'assert'
import {mount} from 'enzyme'

describe('Addons | Presenter', function() {

  it ('requires an implementation of a render method', function() {
    assert.throws(() => mount(<Presenter />), 'Presenter must implement a render method')
  })

  context('When a view can send messages', function() {
    const View = React.createClass({
      contextTypes: {
        send: React.PropTypes.func.isRequired
      },
      render() {
        return <button id="button" onClick={ () => this.context.send('test', true) } />
      }
    })

    it ('receives intent events', function(done) {
      class MyPresenter extends Presenter {
        test(app, params) {
          assert.equal(app, this.props.app)
          assert.equal(params, true)
          done()
        }

        render() {
          return <View />
        }
      }

      mount(<MyPresenter app={ new Microcosm() } />).find(View).simulate('click')
    })
  })

  context('When a presenter has a view model', function() {
    class MyPresenter extends Presenter {
      viewModel() {
        return {
          color: state => state.color
        }
      }

      render() {
        return <p>{ this.state.color }</p>
      }
    }

    beforeEach(function() {
      this.app = new Microcosm()
      this.app.replace({ color: 'red' })
      this.presenter = mount(<MyPresenter app={ this.app } />)
    })

    it ('builds the view model into state', function() {
      assert.equal(this.presenter.state('color'), 'red')
    })

    context('and when the application changes', function() {
      beforeEach(function() {
        this.app.replace({ color: 'purple' })
      })

      it ('updates the view model', function() {
        assert.equal(this.presenter.state('color'), 'purple')
      })
    })
  })
})
