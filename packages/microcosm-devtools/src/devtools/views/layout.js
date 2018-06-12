import React from 'react'
import RightRail from './right-rail'
import LeftRail from './left-rail'
import Tree from './tree'
import css from './layout.css'

class Layout extends React.Component {
  state = {
    leftRail: true,
    rightRail: true
  }

  render() {
    const { history } = this.props
    const { leftRail, rightRail } = this.state

    return (
      <div className={css.container}>
        <main className={css.body}>
          <LeftRail open={leftRail} />
          <Tree history={history} />
          <RightRail open={rightRail} />
        </main>
      </div>
    )
  }
}

export default Layout
