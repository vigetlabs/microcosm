/**
 * Microcontroller
 *
 * A mixin designed for use with Microcosm for computed
 * properties. Whenever new props are sent into a component
 * or a microcosm changes, it will look at the "selections"
 * property of the component and process all of the key/value
 * pairs included within it.
 *
 * Example:
 *
 * React.createClass({
 *   mixins: [ Microcontroller ],
 *   selections: {
 *     double: appState => appState.count * 2
 *   },
 *   render () {
 *    return <p>Twice the count is { this.state.double }</p>
 *   }
 * })
 */

const Microcosm = require('../../src/Microcosm')
const remap = require('../../src/remap')

export default {

  getInitialState() {
    return this._getBindings(this.props)
  },

  componentDidMount() {
    const instance = this._getInstance()

    if (!instance) {
      throw TypeError(`Microcontroller expected ${this.constructor.displayName} to have an "app" or "instance" property but got ${ typeof instance }`)
    }

    this._getInstance().listen(this._change)
  },

  componentWillUnmount() {
    this._getInstance().ignore(this._change)
  },

  componentWillReceiveProps(props) {
    this._update(props)
  },

  _getInstance() {
    return this.props.app || this.props.instance
  },

  _change() {
    this._update(this.props)
  },

  _getBindings(props) {
    let { state } = this._getInstance()

    if (this.selections == null) {
      throw TypeError(`${this.constructor.displayName} expected selections but instead got ${ this.selections }`)
    }

    return remap(this.selections, selector => selector(state, props))
  },

  _update(props=this.props) {
    let next = this._getBindings(props)
    let diff = Object.keys(next).some(key => (this.state[key] !== next[key]))

    if (diff) {
      this.setState(next)
    }
  }

}
