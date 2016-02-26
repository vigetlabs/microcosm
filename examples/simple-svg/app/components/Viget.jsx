import React from 'react'

export default function Viget ({ circle }) {
  var { cx, cy, r } = circle

  return (
    <svg height="300" width="250" version="1.1">
      <title>Microcosm SVG Chart Example</title>
      <g transform="translate(125, 150)">
        <circle key="earth" r="25" fill="#1496bb" />
        <circle key="moon" cx={ cx } cy={ cy } r={ r } fill="#f26d21" />
      </g>
    </svg>
  )
}
