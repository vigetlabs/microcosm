import React from 'react'
import classNames from 'classnames'
import { ActionButton } from 'microcosm-dom'
import humanize from '../../utils/humanize'
import css from './left-rail.css'
import colors from '../../colors'

const stop = e => e.stopPropagation()

class Item extends React.Component {
  itemClass() {
    let { action, head, isFocused } = this.props

    return classNames(css.item, {
      [css.head]: action.id == head,
      [css.disabled]: action.disabled,
      [css.focused]: isFocused
    })
  }

  render() {
    let { action } = this.props

    return (
      <div className={this.itemClass()}>
        <span className={css.name}>
          <span
            className={css.emblem}
            style={{ color: colors[action.status] }}
          />{' '}
          {humanize(action.type)}
        </span>

        <span className={css.actions}>
          <ActionButton
            action="checkout"
            value={action.id}
            className={css.checkout}
            onClick={stop}
          >
            <span>checkout</span>
          </ActionButton>

          <ActionButton
            action="toggle"
            value={action.id}
            className={action.disabled ? css.show : css.hide}
            onClick={stop}
          >
            <span>{action.disabled ? 'enable' : 'disable'}</span>
          </ActionButton>

          <ActionButton
            action="remove"
            value={action.id}
            className={css.remove}
            onClick={stop}
          >
            <span>remove</span>
          </ActionButton>
        </span>
      </div>
    )
  }
}

export default Item
