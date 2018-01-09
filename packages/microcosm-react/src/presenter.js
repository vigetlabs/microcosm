import { createElement, Fragment, PureComponent } from 'react'
import { Microcosm, Observable, merge, tag } from 'microcosm'
import { advice, noop } from './utilities'

function install(presenter, mediator, repo) {
  advice(Presenter, presenter, 'componentWillUpdate')
  advice(Presenter, presenter, 'componentDidMount')

  mediator.repo = presenter.getRepo(repo)

  presenter.mediator = mediator
  presenter.didFork = mediator.repo !== repo
}

function renderMediator() {
  return createElement(PresenterMediator, {
    repo: this.props.repo,
    presenter: this
  })
}

export class Presenter extends PureComponent {
  constructor() {
    super(...arguments)
    this.state = {}
    this.render = renderMediator
  }

  get model() {
    return this.mediator.model.payload
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

  getRepo(inherited) {
    return inherited ? inherited.fork() : new Microcosm()
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
    this.teardown(this.repo, this.props, this.state)

    if (this.didFork) {
      this.repo.shutdown()
    }
  }

  render() {
    return createElement(Fragment, {
      children: this.props.children || null
    })
  }
}

class PresenterMediator extends PureComponent {
  constructor() {
    super(...arguments)

    this.model = Observable.of({})
    this.presenter = this.props.presenter

    install(this.presenter, this, this.props.repo || this.context.repo)

    this.state = {}
    this.send = this.send.bind(this)
  }

  getChildContext() {
    return {
      repo: this.repo,
      send: this.send,
      parent: this
    }
  }

  componentWillMount() {
    this.presenter.setup(this.repo, this.presenter.props, this.presenter.state)
    this.updateModel(this.presenter.props, this.presenter.state)
  }

  componentWillUnmount() {
    this.model.unsubscribe()
  }

  render() {
    return Object.getPrototypeOf(this.presenter).render.call(this.presenter)
  }

  updateModel(props, state) {
    this.model.unsubscribe()

    this.model = Observable.hash(
      merge(
        this.model.payload,
        this.presenter.getModel(this.repo, props, state)
      )
    )

    this.model.subscribe(this.setState.bind(this))

    // TODO: Why is this necessary?
    this.setState(this.model.payload)
  }

  send(intent, ...params) {
    let mediator = this
    let taggedIntent = tag(intent)

    while (mediator) {
      let handler = mediator.presenter.intercept()[taggedIntent]

      if (handler) {
        return handler.call(mediator.presenter, mediator.repo, ...params)
      }

      mediator = mediator.context.parent
    }

    return this.repo.push(taggedIntent, ...params)
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
