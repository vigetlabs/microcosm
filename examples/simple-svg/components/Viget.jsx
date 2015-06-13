import React from 'react'

export default React.createClass({
  render() {
    var { cx, cy, r } = this.props.circle

    return (
      <svg height="600" width="600" version="1.1">
        <title>Microcosm SVG Chart Example</title>
        <circle cx={ 150 } cy={ 150 } r={ 25 } fill="#1496bb" />
        <circle cx={ cx } cy={ cy } r={ r } fill="#f26d21" />
      </svg>
    )
  }
})
