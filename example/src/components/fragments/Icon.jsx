import React from 'react'

let Icon = React.createClass({

  propTypes: {
    src: React.PropTypes.string.isRequired
  },

  getDefaultProps() {
    return {
      className : '',
      element   : 'button'
    }
  },

  render() {
    let { children, className, element, src, ...safe } = this.props

    return React.createElement(element, {
      className: `icon ${ className }`,
      dangerouslySetInnerHTML: { __html: `${ src }` },
      ...safe
    })
  }

})

export default Icon
