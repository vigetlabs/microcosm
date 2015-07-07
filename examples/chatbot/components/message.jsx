import React from 'react'

export default React.createClass({

  getDefaultProps() {
    return {
      user: '',
      message: '',
      pending: false,
      time: new Date()
    }
  },

  render() {
    const { user, time, message, pending } = this.props

    const status = pending ? 'sending...' : '✔'

    return (
      <li className={ pending ? 'loading' : null }>
        <b>{ user } </b>
        <time dateTime={ time.toString() }>
          { time.toDateString() } { status }
        </time>
        <blockquote>{ message }</blockquote>
      </li>
    )
  }

})
