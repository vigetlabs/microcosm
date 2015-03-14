import React from 'react'
import query from 'query'

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

    return React.createElement(element, other, query(children, flux.stores))
  }

})

export default Microscope
