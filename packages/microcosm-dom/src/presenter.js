import { Microcosm, Observable, Subject } from 'microcosm'
import { advice, noop } from './utilities'
import { intercept } from './intercept'

export function generatePresenter(createElement, Component) {
  function renderMediator() {
    return createElement(PresenterMediator, {
      repo: this.props.repo,
      presenter: this,
      __props: this.props,
      __state: this.state
    })
  }

  class Presenter extends Component {
    constructor() {
      super(...arguments)

      this.state = {}

      // Ensure key lifecycle methods are protected by first applying
      // prototype behavior, then any extended behavior
      advice(Presenter, this, 'componentWillUpdate')
      advice(Presenter, this, 'componentDidMount')

      // Override the given render method so that the mediator can boot.
      // The original render method gets called in the mediator
      this.render = renderMediator
    }

    get model() {
      return this.mediator.model.payload || {}
    }

    get repo() {
      return this.mediator.repo
    }

    setup(repo, props, state) {
      // NOOP
    }

    ready(repo, props, state) {
      // NOOP
    }

    update(repo, nextProps, nextState) {
      // NOOP
    }

    teardown(repo, props, state) {
      // NOOP
    }

    intercept() {
      return {}
    }

    getRepo(repo) {
      return repo.fork()
    }

    getModel(repo, presenterProps, presenterState) {
      return {}
    }

    componentDidMount() {
      this.ready(this.repo, this.props, this.state)
    }

    componentWillUpdate(props, state) {
      this.mediator.updateModel(props, state)
      this.update(this.repo, props, state)
    }

    componentWillUnmount() {
      this.mediator.model.cancel()
      this.teardown(this.repo, this.props, this.state)

      if (this.didFork) {
        this.repo.complete()
      }
    }

    render() {
      if (Array.isArray(this.props.children)) {
        return this.props.children[0] || null
      }

      return this.props.children || null
    }

    get send() {
      return intercept.bind(null, this.mediator)
    }
  }

  class PresenterMediator extends Component {
    constructor(props, context) {
      super(props, context)

      this.model = Observable.of({})
      this.presenter = props.presenter

      let prepo = props.repo || context.repo || new Microcosm()

      this.repo = this.presenter.getRepo(prepo)

      this.presenter.mediator = this
      this.presenter.didFork = this.repo !== prepo

      this.state = {}
    }

    getChildContext() {
      return {
        repo: this.repo,
        send: this.presenter.send,
        parent: this
      }
    }

    componentWillMount() {
      this.presenter.setup(
        this.repo,
        this.presenter.props,
        this.presenter.state
      )
      this.updateModel(this.presenter.props, this.presenter.state)
    }

    render() {
      return Object.getPrototypeOf(this.presenter).render.call(this.presenter)
    }

    updateModel(props, state) {
      this.model.cancel()

      this.model = Subject.hash(
        this.presenter.getModel(this.repo.domains, props, state)
      )

      this.model.subscribe(this.setState.bind(this))
    }
  }

  PresenterMediator.contextTypes = {
    repo: noop,
    send: noop,
    parent: noop
  }

  PresenterMediator.childContextTypes = {
    repo: noop,
    send: noop,
    parent: noop
  }

  return Presenter
}
