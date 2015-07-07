import React from 'react'

export default React.createClass({

  propTypes: {
    onSubmit: React.PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      message: ''
    }
  },

  send(e) {
    e.preventDefault()

    if (this.state.message.length > 0) {
      this.props.onSubmit(this.state.message)
    }
  },

  setMessage(e) {
    this.setState({
      message: e.target.value
    })
  },

  componentWillReceiveProps() {
    this.setState({ message: '' })
  },

  render() {
    const { message } = this.state

    return (
      <form onSubmit={ this.send }>
        <label className="audible" htmlFor="chat">Respond to Eliza:</label>
        <input id="chat" type="text" onChange={ this.setMessage } value={ message } autoComplete="off" />
        <input type="submit" value="Reply" disabled={ message.length <= 0 } />
      </form>
    )
  }

})
