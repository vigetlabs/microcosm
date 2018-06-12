import React from 'react'
import humanize from '../../utils/humanize'
import ActionButton from 'microcosm/addons/action-button'
import css from './tree.css'
import colors from '../../colors'

export default function Node({ action, x, y, index, head }) {
  let offsetY = index % 2 ? 22 : -22
  let offsetX = 17
  let color = colors[action.status]
  let opacity = action.disabled ? '0.35' : '1'
  let label = humanize(action.type)

  return (
    <ActionButton
      className={css.node}
      id={'node-' + action.id}
      transform={`translate(${x},${y})`}
      opacity={opacity}
      action="checkout"
      value={action.id}
      tag="g"
    >
      <circle r="2" fill={color} stroke="transparent" strokeWidth="5" />

      <line x2={offsetX} y2={offsetY} stroke="transparent" strokeWidth="5" />
      <line x2={offsetX} y2={offsetY} stroke={color} />

      <circle cx={offsetX} cy={offsetY} r="2" fill={color} />

      <rect
        className={css.clipping}
        y={offsetY - 11}
        x={offsetX}
        width={16 + label.length * 5.9}
        height={22}
        rx="3"
        ry="3"
        fill="transparent"
        stroke={color}
      />

      <text
        x={offsetX + 8}
        y={offsetY}
        fontSize="11"
        textAnchor="start"
        fontWeight="300"
        fill={action.id == head ? '#fdd54d' : '#eee'}
        letterSpacing="0.05em"
        dominantBaseline="middle"
      >
        {label}
      </text>
    </ActionButton>
  )
}

Node.defaultProps = {
  x: 0,
  y: 0
}
