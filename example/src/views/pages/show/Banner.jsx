import BackIcon   from 'assets/icons/arrow-back'
import DeleteIcon from 'assets/icons/delete'
import Icon       from 'views/parts/Icon'
import Link       from 'views/parts/Link'
import React      from 'react'

export default React.createClass({

  propTypes: {
    list     : React.PropTypes.object.isRequired,
    onRemove : React.PropTypes.func.isRequired
  },

  render() {
    let { list, onRemove } = this.props

    let { color, contrast, name } = list.valueOf()

    return (
      <header className="ruled-bottom" style={{ background: color, color: contrast }}>
        <div className="flex pad-2">
          <div className="flex-grow">
            <Icon src={ BackIcon } element={ Link } href="/" />
          </div>
          <Icon src={ DeleteIcon } onClick={ onRemove } />
        </div>
        <div className="container pad-2-top pad-7-bottom">
          <h1 className="type-display">{ name }</h1>
        </div>
      </header>
    )
  }

})
