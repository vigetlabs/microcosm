import React from 'react'
import Row from './row'

export default function Canvas ({ pixels, height, width, send }) {
  const scaleX = width / pixels[0].length
  const scaleY = height / pixels.length
  const transform = `scale(${scaleX}, ${scaleY})`

  return (
    <svg width={width} height={height}>
      <g
        transform={transform}
        stroke="black"
        strokeWidth={0.25 / scaleX}
        strokeOpacity="0.2"
      >
        {pixels.map((row, y) => <Row key={y} cells={row} y={y} />)}
      </g>
    </svg>
  )
}

Canvas.defaultProps = {
  pixels: [],
  height: 400,
  width: 400
}
