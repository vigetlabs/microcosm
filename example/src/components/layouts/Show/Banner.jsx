import BackIcon   from 'icons/arrow-back'
import DeleteIcon from 'icons/delete'
import Icon       from 'fragments/Icon'
import Link       from 'fragments/Link'
import React      from 'react'

let Banner = React.createClass({

  propTypes: {
    list     : React.PropTypes.object.isRequired,
    onRemove : React.PropTypes.func.isRequired
  },

  render() {
    let { list, onRemove } = this.props

    return (
      <header className="ruled-bottom" style={{ background: list.color, color: list.contrast }}>
        <div className="flex pad-2">
          <div className="flex-grow">
            <Icon src={ BackIcon } element={ Link } href="/" />
          </div>
          <Icon src={ DeleteIcon } onClick={ onRemove } />
        </div>
        <div className="container pad-2-top pad-7-bottom">
          <h1 className="type-display">{ list.name }</h1>
        </div>
      </header>
    )
  }

})

export default Banner
