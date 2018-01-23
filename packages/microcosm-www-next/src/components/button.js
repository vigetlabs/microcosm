import React from 'react'
import { BrowserIcon, PlanetIcon } from '../images'

export default class Button extends React.Component {
  state = { runFadeAnim: '' }

  componentWillReceiveProps(nextProps) {
    if (nextProps.microcosmView !== this.props.microcosmView) {
      this.setState({ runFadeAnim: ' -run-fade' })
      this.stopAnimation()
    }
  }

  stopAnimation() {
    setTimeout(() => {
      this.setState({ runFadeAnim: '' })
    }, 700)
  }

  render() {
    return (
      <button
        onClick={this.props.switchView}
        className={'section__toggle-btn' + this.state.runFadeAnim}
      >
        {this.props.microcosmView ? <BrowserIcon /> : <PlanetIcon />}
        {this.props.microcosmView ? 'Browser View' : 'Microcosm View'}
      </button>
    )
  }
}
