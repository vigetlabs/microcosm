import React from 'react'
import page  from 'page'

let Link = React.createClass({

  propTypes: {
    href: React.PropTypes.string.isRequired
  },

  render() {
    return (
      <a {...this.props} onClick={ this._onClick }>
        { this.props.children }
      </a>
    )
  },

  _onClick(e) {
    e.preventDefault()
    page(this.props.href)
  }

})

export default Link
