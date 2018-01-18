import React from 'react'

export default class Header extends React.Component {
  componentDidMount() {
    this.el = document.getElementById('fade-in-header')
    this.listenForAnimationEnd(this.el)
  }

  listenForAnimationEnd(el) {
    el.addEventListener('animationend', () => {
      el.classList.remove('fade-in')
    })
  }

  componentWillUpdate() {
    this.el.classList.add('fade-in')
  }

  render() {
    return (
      <h2 id="fade-in-header" className="section__content__heading">
        <span className={this.props.bookendClass}>{this.props.number}</span>
        {this.props.text}
      </h2>
    )
  }
}
