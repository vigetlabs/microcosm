import React from 'react'
import Presenter from 'microcosm/addons/presenter'
import ActionFocus from './action-focus'
import DataView from './data-view'
import Resizable from '../resizable'
import css from './right-rail.css'

class RightRail extends Presenter {
  static defaultProps = {
    open: true
  }

  getModel() {
    return {
      snapshot: state => state.snapshot,
      focused: state =>
        state.history.list.find(action => action.id == state.history.focused)
    }
  }

  render() {
    const { open } = this.props
    const { snapshot, focused } = this.model
    const maxWidth = window.innerWidth * 0.4

    if (!open) {
      return null
    }

    return (
      <Resizable defaultWidth={0.25} maxWidth={maxWidth} handlePosition="left">
        <section className={css.pane}>
          <header className={css.header}>
            <h2 className={css.title}>State</h2>
          </header>
          <div className={css.well}>
            <DataView data={snapshot} hideRoot />
          </div>
          <ActionFocus action={focused} />
        </section>
      </Resizable>
    )
  }
}

export default RightRail
