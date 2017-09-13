import React from 'react'
import ActionForm from 'microcosm/addons/action-form'
import { addItem } from '../../../actions/items'

class ItemForm extends React.PureComponent {
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
      <ActionForm action={addItem} onSubmit={this.reset}>
        <input type="hidden" name="list" value={this.props.list} />

        <div className="textfield">
          <label htmlFor="item-name">Name</label>
          <input
            id="item-name"
            name="name"
            value={name}
            onChange={this.setName}
            required
          />
        </div>

        <button className="btn">Add Item</button>
      </ActionForm>
    )
  }
}

export default ItemForm
