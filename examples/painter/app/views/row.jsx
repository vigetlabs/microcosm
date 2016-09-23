import React from 'react'
import withIntent from '../../../../src/addons/with-intent'

withIntent(function Cell ({ x, y, active, send }) {
  const color = active ? 'black' : 'white'
  const paint = () => send('paint', { x, y })

  return <rect key={x} x={x} y={y} onClick={paint} fill={color} width="1" height="1"/>
})

export default function Row ({ cells, y, onClick }) {

  return (
    <g key={ y }>
      { cells.map((active, x) => Cell({ x, y, active, onClick })) }
    </g>
  )
}
