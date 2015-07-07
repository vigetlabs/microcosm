import React from 'react'

export default React.createClass({
  render() {
    const { user, message } = this.props

    return (
      <div className="audible" aria-live="polite">
        { user + ' said: ' + message }
      </div>
    )
  }
})
