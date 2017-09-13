import React from 'react'
import withSend from 'microcosm/addons/with-send'

export default withSend(
  class ActionRegion extends React.Component {
    static defaultProps = {
      tag: 'div'
    }

    onClick = () => {
      this.props.send(this.props.action, this.props.payload)
    }

    render() {
      const { tag, children } = this.props

      return React.createElement(tag, { onClick: this.onClick }, children)
    }
  }
)
