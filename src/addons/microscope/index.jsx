import React from 'react'

let Microscope = React.createClass({

  getInitialState() {
    return this.getState()
  },

  getState() {
    return this.props.instance.state
  },

  updateState() {
    this.setState(this.getState())
  },

  componentDidMount() {
    this.props.instance.listen(this.updateState)
  },

  componentWillUnmount() {
    this.props.instance.ignore(this.updateState)
  },

  getChild() {
    return React.cloneElement(this.props.children, this.state)
  },

  getChildren() {
    let children = React.Children.map(this.props.children, child => {
      return React.cloneElement(child, this.state)
    })

    return (<span>{ children }</span>)
  },

  render() {
    let count = React.Children.count(this.props.children)
    return count > 1 ? this.getChildren() : this.getChild()
  }

})

export default Microscope
