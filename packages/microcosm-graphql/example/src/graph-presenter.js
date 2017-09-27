import React from 'react'

export default class GraphPresenter extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = { model: {} }
  }

  componentWillMount() {
    this.tick()
    this.query = this.props.repo.compile(this.model)
    this.props.repo.on('change', this.tick, this)
  }

  get variables() {
    return {}
  }

  rollforward() {
    let model = this.query(this.props.repo.state, this.variables)

    return { model }
  }

  tick() {
    this.setState(this.rollforward)
  }
}
