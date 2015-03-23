import React from 'react'

let AddItem = React.createClass({

  propTypes: {
    onSubmit: React.PropTypes.func.isRequired
  },

  getDefaultProps() {
    return {
      className   : 'textfield',
      type        : 'text',
      placeholder : 'New Item'
    }
  },

  getInitialState(){
    return {
      name: ''
    }
  },

  render() {
    let { onSubmit, ...safe } = this.props

    return (
      <form onSubmit={ this._onSubmit }>
        <label className="label">Name</label>
        <input value={ this.state.name }
               onChange={ this._onChange }
               required
               {...safe } />
      </form>
    )
  },

  _onChange(e) {
    this.setState({ name: e.target.value })
  },

  _onSubmit(e){
    e.preventDefault()
    this.props.onSubmit(this.state.name);
    this.setState({ name: '' })
  },

});

module.exports = AddItem;
