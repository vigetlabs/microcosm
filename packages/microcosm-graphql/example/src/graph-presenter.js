import React from 'react'

export default class GraphPresenter extends React.Component {
  constructor(props, context) {
    super(props, context)

    this.state = { model: {} }

    this.props.repo.on('change', this.tick, this)
  }

  rollforward(state) {
    var model = this.props.repo.query(this.model)

    if (model !== state.model) {
      return { model }
    }

    return null
  }

  tick() {
    this.setState(this.rollforward)
  }

  componentWillMount() {
    this.tick()
  }
}
