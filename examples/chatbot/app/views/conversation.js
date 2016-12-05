import React   from 'react'
import Message from './message'

class Conversation extends React.PureComponent {
  static defaultProps = {
    messages: []
  }

  componentDidUpdate() {
    let el = this.refs.list

    el.scrollTop = el.scrollHeight
  }

  getMessage(message) {
    return (<Message key={ message.id } { ...message } />)
  }

  render() {
    const { messages } = this.props

    return (
      <ol className="conversation" ref="list">
        { messages.map(this.getMessage, this) }
      </ol>
    )
  }
}

export default Conversation
