import AddItem     from './AddItem'
import ListActions from 'actions/lists'
import React       from 'react'
import classNames  from 'classnames'

let randomColor = () => '#'+Math.floor(Math.random()*16777215).toString(16);

let AddList = React.createClass({

  propTypes: {
    app : React.PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      color: randomColor()
    }
  },

  render() {
    let { active, onExit } = this.props

    return (
      <div className={ classNames('bottomsheet', { 'is-active' : active }) }>
        <div className="bottomsheet__blackout" onClick={ onExit } />
        <div className="container relative pad-2-top pad-4-bottom fill-white shadow-1 radius-2">
          <AddItem onSubmit={ this._onAddList } />
          <label className="label">Background Color</label>
          <input type="color" value={ this.state.color } onChange={ this._onChange } />
        </div>
      </div>
    )
  },

  _onChange({ target }) {
    this.setState({ color: target.value })
  },

  _onAddList(name) {
    let { app, onExit } = this.props

    app.push(ListActions.add, { name, color: this.state.color })

    this.setState({ color: randomColor() })

    onExit()
  }

})

export default AddList
