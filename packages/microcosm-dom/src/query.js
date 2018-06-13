import React from 'react'
import { Subject } from 'microcosm'
import { shallowDiffers } from './utilities'
import { RepoContext } from './repo-provider'
import { merge } from 'microcosm'

export function Query(props) {
  return (
    <RepoContext.Consumer>
      {repo => React.createElement(Fetcher, merge({ repo }, props))}
    </RepoContext.Consumer>
  )
}

function cacheable(props, last) {
  return (
    last.source === props.source &&
    shallowDiffers(props.params, last.params) === false
  )
}

class Fetcher extends React.Component {
  static getDerivedStateFromProps(props, last) {
    if (cacheable(props, last)) {
      return last
    }

    let [key, method] = props.source.split('.')
    let domain = props.repo.domains[key]

    let consumer = new Subject()
    let observable = domain[method](props.params)
    let provider = observable.subscribe(consumer)

    if (last.provider) {
      last.provider.unsubscribe()
    }

    return {
      loading: true,
      result: consumer.payload,
      consumer: consumer,
      params: props.params,
      provider: provider,
      source: props.source
    }
  }

  constructor(props) {
    super(props)
    this.state = Fetcher.getDerivedStateFromProps(this.props, {})
  }

  componentDidMount() {
    this.finalize()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.consumer !== this.state.consumer) {
      this.finalize()
    }
  }

  componentWillUnmount() {
    this.state.provider.unsubscribe()
    this.sub.unsubscribe()
  }

  finalize() {
    if (this.sub) {
      this.sub.unsubscribe()
    }

    this.sub = this.state.consumer.subscribe({
      next: result => this.setState({ result, loading: false }),
      error: error => this.setState({ result: null, error, loading: false })
    })
  }

  render() {
    let { children, render } = this.props
    let { result, error, loading, params } = this.state

    return React.createElement(render || children, {
      data: result ? result.data : null,
      meta: result ? result.meta : null,
      error,
      loading,
      params
    })
  }
}
