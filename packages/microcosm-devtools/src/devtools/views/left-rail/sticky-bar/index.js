import React from 'react'
import { ActionButton } from 'microcosm-dom'
import css from './sticky-bar.css'

export default function StickyBar() {
  return (
    <div className={css.container}>
      <ActionButton className={css.action} action="commit" tag="div">
        Commit
      </ActionButton>

      <ActionButton className={css.action} action="revert" tag="div">
        Revert
      </ActionButton>
    </div>
  )
}
