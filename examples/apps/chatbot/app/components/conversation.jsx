import React   from 'react'
import Message from './message'
import DOM     from 'react-dom'

export default React.createClass({

  getDefaultProps() {
    return {
      messages: []
    }
  },

  componentDidUpdate() {
    let el = DOM.findDOMNode(this)

    el.scrollTop = el.scrollHeight
  },

  getMessage(message) {
    return (<Message key={ message.id } { ...message } />)
  },

  render() {
    const { messages } = this.props

    return (
      <ol className="conversation">
        { messages.map(this.getMessage) }
      </ol>
    )
  }

})
