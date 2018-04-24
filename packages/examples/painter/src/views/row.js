import React from 'react'
import { withSend } from 'microcosm-dom'

import { paint } from '../actions/pixels'

function Cell({ x, y, active, onClick }) {
  const color = active ? 'black' : 'white'

  return (
    <rect x={x} y={y} onClick={onClick} fill={color} width="1" height="1" />
  )
}

export default withSend(function Row({ cells, y, send }) {
  return (
    <g key={y}>
      {cells.map((active, x) => (
        <Cell
          key={x}
          x={x}
          y={y}
          active={active}
          onClick={() => send(paint, { x, y })}
        />
      ))}
    </g>
  )
})
