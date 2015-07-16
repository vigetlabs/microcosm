import React from 'react'

export default React.createClass({
  getDefaultProps() {
    return {
      title: 'Microcosm SVG Chart Example',
      height: 300,
      width: 250
    }
  },

  render() {
    var { title, width, height } = this.props
    var { cx, cy, r } = this.props.circle

    return (
      <svg height={ height } width={ width } version="1.1">
        <title>{ title }</title>
        <g transform={ `translate(${ width * 0.5}, ${ height * 0.5 })` }>
          <circle key="earth" r="25" fill="#1496bb" />
          <circle key="moon" cx={ cx } cy={ cy } r={ r } fill="#f26d21" />
        </g>
      </svg>
    )
  }
})
