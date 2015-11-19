import React from 'react'

export default React.createClass({

  propTypes: {
    app: React.PropTypes.object.isRequired
  },

  getInitialState() {
    return this.props.app.state
  },

  componentDidMount() {
    this.props.app.listen(this.setState, this)
  },

  render() {
    return React.cloneElement(this.props.children, this.state)
  }

})
