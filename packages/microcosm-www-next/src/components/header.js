import React from 'react'

export default class Header extends React.Component {
  // state = { runFadeAnim: '' }

  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.text !== this.props.text) {
  //     this.setState({ runFadeAnim: ' -run-fade' })
  //     this.stopAnimation()
  //   }
  // }

  // stopAnimation() {
  //   setTimeout(() => {
  //     this.setState({ runFadeAnim: '' })
  //   }, 700)
  // }

  render() {
    return (
      <h2 className='section__content__heading'>
        <span className={this.props.bookendClass}>{this.props.number}</span>
        {this.props.text}
      </h2>
    )
  }
}
