import React from 'react'

export default class Subheading extends React.Component {
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
      <h3 className={'section__content__subheading' + this.state.runFadeAnim}>
        {this.props.text}{' '}
        {this.props.microcosmView
          ? this.props.microcosmText
          : this.props.browserText}
      </h3>
    )
  }
}
