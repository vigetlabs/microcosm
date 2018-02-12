import React from 'react'
import ReactDOM from 'react-dom'

export function delay(n = 10) {
  return new Promise(resolve => setTimeout(resolve, 10))
}

export function unmount(el) {
  if (el) {
    ReactDOM.unmountComponentAtNode(el.parentElement)
  }
}

export function mount(dom) {
  let el = document.createElement('div')

  document.body.appendChild(el)

  ReactDOM.render(dom, el)

  return el.firstChild
}

export function submit(form) {
  return form.dispatchEvent(new Event('submit'))
}

export class PropsTransition extends React.Component {
  static defaultProps = {
    updater(presenter) {
      presenter.setState(presenter.props.after)
    }
  }

  constructor() {
    super(...arguments)
    this.state = this.props.before
  }

  componentDidMount() {
    this.props.updater(this)
  }

  render() {
    return React.createElement(this.props.component, this.state)
  }
}
