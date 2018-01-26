import { render, h, Component } from 'preact'

export function delay(n = 10) {
  return new Promise(resolve => setTimeout(resolve, 10))
}

export function unmount(el) {
  return render('', el, el)
}

export function mount(...args) {
  return render(...args)
}

export function remount(component, el) {
  return mount(component, el, el.firstChild)
}

export function submit(form) {
  return form.dispatchEvent(new Event('submit'))
}

export class PropsTransition extends Component {
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
    return h(this.props.component, this.state)
  }
}
