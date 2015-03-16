import Microscope from '../Microscope'
import React      from 'react/addons'

describe('Microscope', function() {
  let Flux = null;

  beforeEach(function() {
    Flux = {
      listen: sinon.spy(),
      ignore: sinon.spy(),
      stores: {
        foo: { state: 'bar' }
      }
    }
  })

  it ('subscribes to a Microcosm instance on mount', function() {
    let Component = React.createClass({
      render: () => (<Microscope flux={ Flux } watch={['foo']} />)
    })

    React.addons.TestUtils.renderIntoDocument(<Component />)

    Flux.listen.should.have.been.called
  })

  it ('unsubscribes to a Microcosm instance on unmount', function() {
    let Component = React.createClass({
      getInitialState() {
        return { hide: false }
      },
      render() {
        return !this.state.hide ? <Microscope flux={ Flux } watch={['foo']} /> : null
      }
    })

    let comp = React.addons.TestUtils.renderIntoDocument(<Component />)

    comp.setState({ hide: true })

    Flux.ignore.should.have.been.called
  })

  it ('passes stores to children', function() {
    let Child = React.createClass({
      render() {
        return (<p>{ this.props.foo }</p>)
      }
    })

    let Component = React.createClass({
      render() {
        return (<Microscope flux={ Flux } watch={['foo']}><Child /></Microscope>)
      }
    })

    let el = React.addons.TestUtils.renderIntoDocument(<Component />)

    el.getDOMNode().textContent.should.equal(Flux.stores.foo.state)
  })

  it ('can manipulate the container element type', function() {
    let Component = React.createClass({
      render: () => (<Microscope element="section" flux={ Flux } watch={['foo']} />)
    })

    let el = React.addons.TestUtils.renderIntoDocument(<Component />)

    el.getDOMNode().tagName.should.equal('SECTION')
  })
})
