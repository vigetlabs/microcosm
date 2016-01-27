import React from 'react'

const ItemForm = React.createClass({
  render() {
    return (
      <form action="#" onSubmit={ this._onSubmit }>
        <div className="textfield">
          <label htmlFor="item-name">Name</label>
          <input id="item-name" required />
        </div>
        <input className="btn" type="submit" value="Add Item" />
      </form>
    )
  },

  _onSubmit(e) {
    e.preventDefault()

    let form = e.target

    this.props.onSubmit({
      name : form.elements['item-name'].value
    })

    form.reset()
  }

})

export default ItemForm
