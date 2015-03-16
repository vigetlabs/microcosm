import React from 'react/addons'

const Microscope = React.createClass({
  mixins: [ React.addons.PureRenderMixin ],

  propTypes: {
    flux  : React.PropTypes.object.isRequired,
    watch : React.PropTypes.array.isRequired
  },

  getDefaultProps() {
    return {
      element: 'div'
    }
  },

  getInitialState() {
    return this.getState()
  },

  getState() {
    const { flux, watch } = this.props

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
    const { children, element, flux, ...other } = this.props

    const members = React.Children.map(children, Component => {
      return React.addons.cloneWithProps(Component, { flux, ...this.state })
    })

    return React.createElement(element, other, members)
  }
})

export default Microscope
