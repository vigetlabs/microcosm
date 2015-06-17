let React = require('react')

module.exports = React.createClass({
  displayName: 'Microscope',

  getInitialState() {
    return this.getState()
  },

  getState() {
    return this.props.instance.toObject()
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
