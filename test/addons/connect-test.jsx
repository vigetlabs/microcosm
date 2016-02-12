import Connect   from '../../src/addons/connect'
import DOM       from 'react-dom'
import Microcosm from '../../src/Microcosm'
import Provider  from '../../src/addons/provider'
import React     from 'react'
import Test      from 'react-addons-test-utils'
import assert    from 'assert'

function assertText(component, text) {
  assert.equal(DOM.findDOMNode(component).textContent, text)
}

describe('Connect Add-on', function() {

  it ('given context, it injects an application instance into a component as a prop', function(done) {
    let app = new Microcosm()

    app.start()

    let Namer = Connect()(React.createClass({
      componentDidMount() {
        assert.equal(this.props.app, app)
        done()
      },
      render() {
        return (<p>Test</p>)
      }
    }))

    Test.renderIntoDocument(<Provider app={ app }><Namer /></Provider>)
  })

  it ('listens to an application when it mounts', function(done) {
    let app = new Microcosm()

    app.start()
    app.listen = () => done()

    let Component = Connect()(props => <p>MVP</p>)
    let component = Test.renderIntoDocument(<Component app={ app } />)
  })

  it ('ignores an application when it unmounts', function(done) {
    let app = new Microcosm()

    app.start()
    app.ignore = () => done()

    let Child  = Connect()(props => <p>MVP</p>)
    let Parent = React.createClass({
      getInitialState() {
        return { display: true }
      },
      render() {
        return this.state.display ? <Child app={ app } /> : null
      }
    })

    let component = Test.renderIntoDocument(<Parent />)

    component.setState({ display: false })
  })

  it ('maps application state to props', function () {
    let app = new Microcosm()

    app.start().replace({ name: 'Kurtz' })

    let Namer = Connect(function(props) {
      return { name: state => props.prefix + ' ' + state.name }
    })(function({ name }) {
      return (<p>{ name }</p>)
    })

    let component = Test.renderIntoDocument(<Namer app={ app } prefix="Colonel" />)

    assertText(component, 'Colonel Kurtz')
  })

  it ('sends new props to the component when an application changes', function () {
    let app = new Microcosm()

    app.start().replace({ name: 'Kurtz' })

    let Namer = Connect(function(props) {
      return { name: state => props.prefix + ' ' + state.name }
    })(function({ name }) {
      return (<p>{ name }</p>)
    })

    let parent = Test.renderIntoDocument(<Namer app={ app } prefix="Colonel" />)

    assertText(parent, 'Colonel Kurtz')
    app.replace({ name: 'Hawk' })
    assertText(parent, 'Colonel Hawk')
  })

  context('when the connection is pure (default option)', function() {

    it ('does not cause a re-render if mapped state values do not change', function () {
      let app = new Microcosm()
      let renders = 0

      app.start().replace({ name: 'Kurtz' })

      let Namer = Connect(function() {
        return { name: state => state.name }
      })(function({ name }) {
        renders += 1
        return (<p>{ name }</p>)
      })

      Test.renderIntoDocument(<Namer app={ app } />)

      app.replace({ name: 'Kurtz', unrelated: true })

      assert.equal(renders, 1)
    })

    it ('does not cause a re-render if state is the same', function () {
      let app = new Microcosm()
      let renders = 0

      app.start().replace({ name: 'Kurtz' })

      let Namer = Connect(function() {
        return { name: state => state.name }
      })(function({ name }) {
        renders += 1
        return (<p>{ name }</p>)
      })

      Test.renderIntoDocument(<Namer app={ app } />)

      app.replace({ name: 'Kurtz' })

      assert.equal(renders, 1)
    })

  })

  context('when the connection is impure', function() {

    it ('always re-renders when the app changes', function () {
      let app = new Microcosm()
      let renders = 0

      app.start().replace({ name: 'Kurtz' })

      let Namer = Connect(function() {
        return { name: state => state.name }
      }, { pure : false })(function({ name }) {
        renders += 1
        return (<p>{ name }</p>)
      })

      Test.renderIntoDocument(<Namer app={ app } />)

      app.replace({ name: 'Kurtz', unrelated: true })

      assert.equal(renders, 2)
    })

  })

  context('when the connection receives new props', function() {

    it ('recalculates mappings if the props are different', function () {
      let app = new Microcosm()
      let renders = 0

      app.start().replace({ name: 'Kurtz' })

      let Namer = Connect(function(props) {
        return { name: state => props.prefix + ' ' + state.name }
      })(function({ name }) {
        return (<p>{ name }</p>)
      })

      let Wrapper = React.createClass({
        getInitialState() {
          return { prefix: this.props.prefix }
        },
        render() {
          return <Namer app={ app } prefix={ this.state.prefix } />
        }
      })

      let parent = Test.renderIntoDocument(<Wrapper prefix="Colonel" />)

      assertText(parent, 'Colonel Kurtz')
      parent.setState({ prefix: 'Captain' })
      assertText(parent, 'Captain Kurtz')
    })

    it ('does not recalculate mappings if the props are the same', function () {
      let app = new Microcosm()
      let remappings = 0

      app.start().replace({ name: 'Kurtz' })

      let Namer = Connect(function(props) {
        remappings += 1
        return { name: state => props.prefix + ' ' + state.name }
      })(function({ name }) {
        return (<p>{ name }</p>)
      })

      let Wrapper = React.createClass({
        getInitialState() {
          return { prefix: this.props.prefix }
        },
        render() {
          return <Namer app={ app } prefix={ this.state.prefix } />
        }
      })

      let parent = Test.renderIntoDocument(<Wrapper prefix="Colonel" />)

      parent.setState({ prefix: 'Colonel' })
      assert.equal(remappings, 1)
    })

    it ('always recalculates mappings when impure', function () {
      let app = new Microcosm()
      let remappings = 0

      app.start().replace({ name: 'Kurtz' })

      let Namer = Connect(function(props) {
        remappings += 1
        return { name: state => props.prefix + ' ' + state.name }
      }, { pure: false })(function({ name }) {
        return (<p>{ name }</p>)
      })

      let Wrapper = React.createClass({
        getInitialState() {
          return { prefix: this.props.prefix }
        },
        render() {
          return <Namer app={ app } prefix={ this.state.prefix } />
        }
      })

      let parent = Test.renderIntoDocument(<Wrapper prefix="Colonel" />)

      parent.setState({ prefix: 'Colonel' })
      assert.equal(remappings, 2)
    })

  })

  it ('exposes a ref through the via prop', function () {
    let app = new Microcosm().start()

    let Component = Connect()(React.createClass({
      sampleProp: true,
      render: () => <p>Test</p>
    }))

    let component = Test.renderIntoDocument(<Component app={ app } via="child" />)

    assert.equal(component.refs.child.sampleProp, true)
  })
})
