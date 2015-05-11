import AddIcon from 'assets/icons/add'
import Icon    from 'views/parts/Icon'
import React   from 'react'

let Banner = React.createClass({

  propTypes: {
    onToggle: React.PropTypes.func.isRequired
  },

  render() {
    return (
      <header className="fill-primary relative ruled-bottom">
        <div className="container pad-9-top pad-7-bottom relative">
          <Icon className="fab absolute bottom right shadow-1" src={ AddIcon } onClick={ this.props.onToggle }/>
          <h1 className="type-display">Todo:</h1>
        </div>
      </header>
    )
  }

})

export default Banner
