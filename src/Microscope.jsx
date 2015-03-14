import React from 'react/addons'

let Microscope = React.createClass({

  propTypes: {
    flux : React.PropTypes.object.isRequired
  },

  getDefaultProps() {
    return {
      element: 'div'
    }
  },

  tick() {
    this.forceUpdate()
  },

  componentDidMount() {
    this.props.flux.listen(this.tick)
  },

  componentWillUnmount() {
    this.props.flux.ignore(this.tick)
  },

  render() {
    let { children, element, flux, ...other } = this.props

    let members = React.Children.map(children, Component => {
      let { query } = Component.type
      let data = query ? query(flux.stores) : null

      return React.addons.cloneWithProps(Component, data)
    })

    return React.createElement(element, other, members)
  }

})

export default Microscope
