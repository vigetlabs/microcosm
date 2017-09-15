import React from 'react'
import ActionForm from 'microcosm/addons/action-form'
import { addList } from '../../../actions/lists'

class ListForm extends React.PureComponent {
  state = {
    name: ''
  }

  reset = () => {
    this.setState({ name: '' })
  }

  setName = e => {
    this.setState({ name: e.target.value })
  }

  render() {
    const { name } = this.state

    return (
      <ActionForm action={addList} onSubmit={this.reset}>
        <div className="textfield">
          <label htmlFor="list-name">Name</label>
          <input
            id="list-name"
            name="name"
            onChange={this.setName}
            value={name}
            required
          />
        </div>

        <button className="btn">Create List</button>
      </ActionForm>
    )
  }
}

export default ListForm
