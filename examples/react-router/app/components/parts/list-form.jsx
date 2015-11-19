import React from 'react'

const ListForm = React.createClass({

  render() {
    return (
      <form action="#" onSubmit={ this._onSubmit }>
        <div className="textfield">
          <label htmlFor="list-name">Name</label>
          <input id="list-name" required />
        </div>
        <input className="btn" type="submit" value="Create List" />
      </form>
    )
  },

  _onSubmit(e) {
    e.preventDefault()

    let form = e.target

    this.props.onSubmit({
      name : form.elements['list-name'].value
    })

    form.reset()
  }

})

export default ListForm
