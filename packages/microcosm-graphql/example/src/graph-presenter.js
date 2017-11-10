import React from 'react'

export default class GraphPresenter extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = { model: {} }
  }

  componentWillMount() {
    const { repo } = this.props

    this.query = repo.compile(this.model)

    this.query({ repo, state: repo.state }).subscribe(model => {
      this.setState({ model })
    })
  }

  get variables() {
    return {}
  }
}
