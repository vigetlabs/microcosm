import React  from 'react'
import {Link} from 'react-router'

export default React.createClass({

  getDefaultProps() {
    return {
      resource: 'Page'
    }
  },

  render() {
    return (
      <div>
        <header className="header">
          <h1 className="text-display container">
            { this.props.resource } Not Found
          </h1>
        </header>

        <main role="main" className="container">
          <p className="spacious">
            It is possible this { this.props.resource.toLowerCase() } was
            removed or never existed.
          </p>
          <p className="spacious">
            <Link to="/">Try starting over from the beginning</Link>
          </p>
        </main>
      </div>
    )
  }
})
