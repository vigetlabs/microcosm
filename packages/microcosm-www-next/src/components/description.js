import React from 'react'

export default class Description extends React.Component {
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
    let endClass = (this.props.num === 0 || this.props.num === 9) ? '-end' : '';

    return (
      <p
        className={
          'section__content__text ' +
          endClass
        }
        dangerouslySetInnerHTML={{ __html: this.props.text }}
      />
    )
  }
}
