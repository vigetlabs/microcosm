import Pure      from 'react-immutable-render-mixin'
import React     from 'react/addons'
import transpose from './transpose'

let Microscope = React.createClass({
  propTypes: {
    flux  : React.PropTypes.object.isRequired,
    watch : React.PropTypes.array.isRequired
  },

  getInitialState() {
    return this.getState()
  },

  getState() {
    let { flux, watch } = this.props

    return watch.reduce(function(memo, key) {
      memo[key] = flux.stores[key].state
      return memo
    }, {})
  },

  updateState() {
    this.setState(this.getState())
  },

  componentDidMount() {
    this.props.flux.listen(this.updateState)
  },

  componentWillUnmount() {
    this.props.flux.ignore(this.updateState)
  },

  render() {
    let { children, flux, ...other } = this.props

    let members = React.Children.map(children, Component => {
      return React.addons.cloneWithProps(Component, { flux, ...this.state })
    })

    return <div { ...other }>{ members }</div>
  }
})

export default Microscope
