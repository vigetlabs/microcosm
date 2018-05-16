import React from 'react'
import assert from 'assert'
import { Subject } from 'microcosm'
import { shallowDiffers } from './utilities'
import { RepoContext } from './repo-provider'

export function Connect(props) {
  return (
    <RepoContext.Consumer>
      {repo => <Fetcher repo={repo} {...props} />}
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

    assert(domain, `Unable to locate domain for "${key}".`)

    assert(
      typeof domain[method] === 'function',
      `Domain "${key}" has method ${method}.`
    )

    let consumer = new Subject()
    let observable = domain[method](props.params)

    assert(observable, `Return an observable from ${key}.${method}`)

    let provider = observable.subscribe(consumer)

    if (last.provider) {
      last.provider.unsubscribe()
    }

    return {
      loading: true,
      answer: consumer.payload,
      consumer: consumer,
      params: props.params,
      provider: provider,
      source: props.source
    }
  }

  static defaultProps = {
    loading: () => null,
    failed: ({ error }) => error.message
  }

  state = Fetcher.getDerivedStateFromProps(this.props, {})

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
      next: answer => this.setState({ answer, loading: false, failed: false }),
      error: error => this.setState({ error, loading: false, failed: true })
    })
  }

  render() {
    let { children, render } = this.props
    let { answer, error, loading, failed } = this.state

    if (loading) {
      return this.props.loading()
    }

    if (failed) {
      return this.props.failed({ error })
    }

    return React.createElement(render || children, answer)
  }
}
