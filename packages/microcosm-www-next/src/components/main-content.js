import React from 'react'

export default class MainContent extends React.Component {

  componentDidMount() {
    this.el = document.getElementById('fade-in-text')
    this.listenForAnimationEnd(this.el)
  }

  listenForAnimationEnd(el) {
    el.addEventListener('animationend', () => {
      el.classList.remove('fade-in')
    })
  }

  componentWillReceiveProps() {
    this.el.classList.add('fade-in')
  }

  render() {
    return (
      <div id='fade-in-text'>
        <p
          className={'section__content__text ' + this.props.bookendClass}
          dangerouslySetInnerHTML={{ __html: this.props.text }}
        />
      </div>
    )
  }
}
