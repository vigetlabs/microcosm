import test from 'ava'
import Connect from '../../src/addons/connect'
import Microcosm from '../../src/microcosm'
import React from 'react'
import {mount} from 'enzyme'

test('handles nully compute functions', t => {
  const Child = () => (<p>Test</p>)

  const Nully = Connect(null)(Child)
  mount(<Nully repo={ new Microcosm() } />)

  const Undefined = Connect(undefined)(Child)
  mount(<Undefined repo={ new Microcosm() } />)
})

test('injects an repo from context into the wrapped component', t => {
  const repo    = new Microcosm()
  const Child  = () => (<p>Test</p>)
  const Parent = Connect()(Child)

  const component = mount(<Parent />, {
    context : { repo }
  })

  t.is(component.find(Child).prop('repo'), repo)
})

test('ignores an repo when it unmounts', t => {
  t.plan(1)

  const repo = new Microcosm()

  repo.off = () => t.pass()

  const Child = Connect()(() => <p>MVP</p>)

  mount(<Child repo={ repo } />).unmount()
})

test('maps repo state to props', t => {
  const repo = new Microcosm()

  repo.replace({ name: 'Kurtz' })

  const Namer = Connect(function(props) {
    return { name: state => props.prefix + ' ' + state.name }
  })(function({ name }) {
    return (<p>{ name }</p>)
  })

  const component = mount(<Namer repo={ repo } prefix="Colonel" />)

  t.is(component.text(), 'Colonel Kurtz')
})

test('sends new props to the component when an repo changes', t => {
  const repo = new Microcosm()

  repo.replace({ name: 'Kurtz' })

  const Namer = Connect(function(props) {
    return { name: state => props.prefix + ' ' + state.name }
  })(function({ name }) {
    return (<p>{ name }</p>)
  })

  const parent = mount(<Namer repo={ repo } prefix="Colonel" />)

  repo.replace({ name: 'Hawk' })

  t.is(parent.text(), 'Colonel Hawk')
})

test('does not cause a re-render if mapped state values do not change', t => {
  const repo = new Microcosm()
  let renders = 0

  repo.replace({ name: 'Kurtz' })

  const Namer = Connect(function() {
    return { name: state => state.name }
  })(function({ name }) {
    renders += 1
    return (<p>{ name }</p>)
  })

  mount(<Namer repo={ repo } />)

  repo.replace({ name: 'Kurtz', unrelated: true })

  t.is(renders, 1)
})

test('does not cause a re-render if state is the same', t => {
  const repo = new Microcosm()
  let renders = 0

  repo.replace({ name: 'Kurtz' })

  const Namer = Connect(function() {
    return { name: state => state.name }
  })(function({ name }) {
    renders += 1
    return (<p>{ name }</p>)
  })

  mount(<Namer repo={ repo } />)

  repo.replace({ name: 'Kurtz' })

  t.is(renders, 1)
})

test('always re-renders impure connections', t => {
  const repo = new Microcosm()
  let renders = 0

  repo.replace({ name: 'Kurtz' })

  const Namer = Connect(function() {
    return { name: state => state.name }
  }, { pure : false })(function({ name }) {
    renders += 1
    return (<p>{ name }</p>)
  })

  mount(<Namer repo={ repo } />)

  repo.replace({ name: 'Kurtz', unrelated: true })

  t.is(renders, 2)
})

test('recalculates mappings if the props are different', t => {
  const repo = new Microcosm()

  repo.replace({ name: 'Kurtz' })

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
      return <Namer repo={ repo } prefix={ this.state.prefix } />
    }
  })

  const parent = mount(<Wrapper prefix="Colonel" />)

  parent.setState({ prefix: 'Captain' })

  t.is(parent.text(), 'Captain Kurtz')
})

test('does not recalculate mappings if the props are the same', t => {
  const repo = new Microcosm()
  let remappings = 0

  repo.replace({ name: 'Kurtz' })

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
      return <Namer repo={ repo } prefix={ this.state.prefix } />
    }
  })

  const parent = mount(<Wrapper prefix="Colonel" />)

  parent.setState({ prefix: 'Colonel' })
  t.is(remappings, 1)
})

test('always recalculates mappings when impure', t => {
  const repo = new Microcosm()
  let remappings = 0

  repo.replace({ name: 'Kurtz' })

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
      return <Namer repo={ repo } prefix={ this.state.prefix } />
    }
  })

  const parent = mount(<Wrapper prefix="Colonel" />)

  parent.setState({ prefix: 'Colonel' })

  t.is(remappings, 2)
})

test('does not waste rendering on nested children', t => {
  const repo = new Microcosm()
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
    return <Child repo={ props.repo } />
  })

  mount(<Parent repo={ repo } />)

  repo.replace({ name: 'Billy Booster' })

  t.is(renders, 2, 'Child should have only rendered twice. Instead rendered ' + renders + ' times')
})
