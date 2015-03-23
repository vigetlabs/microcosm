import React   from 'react'
import AddItem from './AddItem'

let randomColor = () => '#'+Math.floor(Math.random()*16777215).toString(16);

let AddList = React.createClass({

  propTypes: {
    onCreate: React.PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      color: randomColor()
    }
  },

  render() {
    let className = 'bottomsheet'

    if (this.props.active) {
      className += ' is-active'
    }

    return (
      <div className={ className }>
        <div className="bottomsheet__blackout" onClick={ this.props.onExit } />
        <div className="container relative pad-2-top pad-4-bottom fill-white shadow-1 radius-2">
          <AddItem onSubmit={ this._onAddList } />
          <label className="label">Background Color</label>
          <input type="color"
                 value={ this.state.color }
                 onChange={ this._onColorChange } />
        </div>
      </div>
    )
  },

  _onColorChange({ target }) {
    this.setState({ color: target.value })
  },

  _onAddList(name) {
    this.props.onCreate({ name, color: this.state.color })
    this.setState({ color: randomColor() })
    this.props.onExit()
  }
})

export default AddList
