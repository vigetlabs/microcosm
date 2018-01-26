import React from 'react'

export default class Description extends React.Component {
  state = { runFadeAnim: '' }

  componentWillReceiveProps(nextProps) {
    if (nextProps.text !== this.props.text) {
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
      <p
        className={
          'section__content__text ' +
          this.props.bookendClass +
          this.state.runFadeAnim
        }
        dangerouslySetInnerHTML={{ __html: this.props.text }}
      />
    )
  }
}
