import Connect   from '../../src/addons/connect'
import DOM       from 'react-dom'
import Microcosm from '../../src/microcosm'
import Provider  from '../../src/addons/provider'
import React     from 'react'
import {mount}   from 'enzyme'
import assert    from 'assert'

describe('Connect Add-on', function() {

  it ('given context, it injects an application instance into a component as a prop', function(done) {
    let app = new Microcosm()

    let Namer = Connect()(React.createClass({
      componentDidMount() {
        assert.equal(this.props.app, app)
        done()
      },
      render() {
        return (<p>Test</p>)
      }
    }))

    mount(<Provider app={ app }><Namer /></Provider>)
  })

  it ('listens to an application when it mounts', function (done) {
    let app = new Microcosm()

    app.on = () => done()

    let Component = Connect()(() => <p>MVP</p>)

    mount(<Component app={ app } />)
  })

  it ('ignores an application when it unmounts', function(done) {
    const app = new Microcosm()

    app.off = () => done()

    const Child  = Connect()(() => <p>MVP</p>)
    const Parent = React.createClass({
      getInitialState() {
        return { display: true }
      },
      render() {
        return this.state.display ? <Child app={ app } /> : null
      }
    })

    mount(<Parent />).setState({ display: false })
  })

  it ('maps application state to props', function () {
    const app = new Microcosm()

    app.replace({ name: 'Kurtz' })

    const Namer = Connect(function(props) {
      return { name: state => props.prefix + ' ' + state.name }
    })(function({ name }) {
      return (<p>{ name }</p>)
    })

    const component = mount(<Namer app={ app } prefix="Colonel" />)

    assert.equal(component.text(), 'Colonel Kurtz')
  })

  it ('sends new props to the component when an application changes', function () {
    const app = new Microcosm()

    app.replace({ name: 'Kurtz' })

    const Namer = Connect(function(props) {
      return { name: state => props.prefix + ' ' + state.name }
    })(function({ name }) {
      return (<p>{ name }</p>)
    })

    const parent = mount(<Namer app={ app } prefix="Colonel" />)

    assert.equal(parent.text(), 'Colonel Kurtz')
    app.replace({ name: 'Hawk' })
    assert.equal(parent.text(), 'Colonel Hawk')
  })

  context('when the connection is pure (default option)', function() {

    it ('does not cause a re-render if mapped state values do not change', function () {
      const app = new Microcosm()
      let renders = 0

      app.replace({ name: 'Kurtz' })

      const Namer = Connect(function() {
        return { name: state => state.name }
      })(function({ name }) {
        renders += 1
        return (<p>{ name }</p>)
      })

      mount(<Namer app={ app } />)

      app.replace({ name: 'Kurtz', unrelated: true })

      assert.equal(renders, 1)
    })

    it ('does not cause a re-render if state is the same', function () {
      const app = new Microcosm()
      let renders = 0

      app.replace({ name: 'Kurtz' })

      const Namer = Connect(function() {
        return { name: state => state.name }
      })(function({ name }) {
        renders += 1
        return (<p>{ name }</p>)
      })

      mount(<Namer app={ app } />)

      app.replace({ name: 'Kurtz' })

      assert.equal(renders, 1)
    })

  })

  context('when the connection is impure', function() {

    it ('always re-renders when the app changes', function () {
      const app = new Microcosm()
      let renders = 0

      app.replace({ name: 'Kurtz' })

      const Namer = Connect(function() {
        return { name: state => state.name }
      }, { pure : false })(function({ name }) {
        renders += 1
        return (<p>{ name }</p>)
      })

      mount(<Namer app={ app } />)

      app.replace({ name: 'Kurtz', unrelated: true })

      assert.equal(renders, 2)
    })

  })

  context('when the connection receives new props', function() {

    it ('recalculates mappings if the props are different', function () {
      const app = new Microcosm()

      app.replace({ name: 'Kurtz' })

      const Namer = Connect(function(props) {
        return { name: state => props.prefix + ' ' + state.name }
      })(function({ name }) {
        return (<p>{ name }</p>)
      })

      const Wrapper = React.createClass({
        getInitialState() {
          return { prefix: this.props.prefix }
        },
        render() {
          return <Namer app={ app } prefix={ this.state.prefix } />
        }
      })

      const parent = mount(<Wrapper prefix="Colonel" />)

      parent.setState({ prefix: 'Captain' })

      assert.equal(parent.text(), 'Captain Kurtz')
    })

    it ('does not recalculate mappings if the props are the same', function () {
      const app = new Microcosm()
      let remappings = 0

      app.replace({ name: 'Kurtz' })

      const Namer = Connect(function(props) {
        remappings += 1
        return { name: state => props.prefix + ' ' + state.name }
      })(function({ name }) {
        return (<p>{ name }</p>)
      })

      const Wrapper = React.createClass({
        getInitialState() {
          return { prefix: this.props.prefix }
        },
        render() {
          return <Namer app={ app } prefix={ this.state.prefix } />
        }
      })

      const parent = mount(<Wrapper prefix="Colonel" />)

      parent.setState({ prefix: 'Colonel' })
      assert.equal(remappings, 1)
    })

    it ('always recalculates mappings when impure', function () {
      const app = new Microcosm()
      let remappings = 0

      app.replace({ name: 'Kurtz' })

      const Namer = Connect(function(props) {
        remappings += 1
        return { name: state => props.prefix + ' ' + state.name }
      }, { pure: false })(function({ name }) {
        return (<p>{ name }</p>)
      })

      const Wrapper = React.createClass({
        getInitialState() {
          return { prefix: this.props.prefix }
        },
        render() {
          return <Namer app={ app } prefix={ this.state.prefix } />
        }
      })

      const parent = mount(<Wrapper prefix="Colonel" />)

      parent.setState({ prefix: 'Colonel' })

      assert.equal(remappings, 2)
    })

  })

  describe('Nested connect instances', function() {
    beforeEach(function () {
      this.app = new Microcosm()
    })

    it ('does not waste rendering on nested children', function() {
      let renders = 0

      const Child = Connect(function () {
        return { name: state => state.name }
      })(function Child (props) {
        renders += 1
        return <p>{ props.name }</p>
      })

      const Parent = Connect(function () {
        return { name: state => state.name }
      })(function Parent (props) {
        return <Child app={ props.app } />
      })

      mount(<Parent app={ this.app } />)

      this.app.replace({ name: 'Billy Booster' })

      assert.equal(renders, 2, 'Child should have only rendered twice. Instead rendered ' + renders + ' times')
    })
  })
})
