import React from 'react'
import Form  from '../../../../../../src/addons/form'

const ItemForm = React.createClass({

  getInitialState() {
    return {
      name : ''
    }
  },

  reset() {
    this.setState({ name: '' })
  },

  setName(e) {
    this.setState({ name : e.target.value })
  },

  render() {
    const { name } = this.state

    return (
      <Form intent="addItem" onSubmit={ this.reset }>
        <input type="hidden" name="list" value={ this.props.list } />

        <div className="textfield">
          <label htmlFor="item-name">Name</label>
          <input id="item-name" name="name" value={ name } onChange={ this.setName } required />
        </div>

        <button className="btn">Add Item</button>
      </Form>
    )
  }
})

export default ItemForm
