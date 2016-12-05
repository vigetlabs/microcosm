import React from 'react'
import Form  from 'microcosm/addons/form'

const ListForm = React.createClass({

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
      <Form intent="addList" onSubmit={ this.reset }>
        <div className="textfield">
          <label htmlFor="list-name">Name</label>
          <input id="list-name" name="name" onChange={ this.setName } value={ name } required />
        </div>

        <button className="btn">Create List</button>
      </Form>
    )
  }
})

export default ListForm
