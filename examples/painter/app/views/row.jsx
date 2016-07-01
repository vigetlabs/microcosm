import React from 'react'

function Cell ({ x, y, active, onClick }) {
  const color = active ? 'black' : 'white'

  return <rect key={ x } x={ x } y={ y } onClick={ () => onClick(x, y) } fill={ color } width="1" height="1"/>
}

export default function Row ({ cells, y, onClick }) {

  return (
    <g key={ y }>
      { cells.map((active, x) => Cell({ x, y, active, onClick })) }
    </g>
  )
}
