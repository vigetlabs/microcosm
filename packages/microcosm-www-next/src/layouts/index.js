import React from 'react'
import PropTypes from 'prop-types'
import Link from 'gatsby-link'
import Helmet from 'react-helmet'

import '../stylesheets/app.scss'

const Navigation = () => (
  <nav className="navigation">
    <div className='wrapper'>
      {/* <h1>
        <Link
          to="/"
          style={{
            color: 'black',
            textDecoration: 'none',
          }}
        >
          Microcosm
        </Link>
      </h1> */}
    </div>
  </nav>
)

const Footer = () => (
  <footer className="footer">
    <div className='wrapper'>
    </div>
  </footer>
)

const PageWrapper = ({ children }) => (
  <div>
    <Helmet
      title="Microcosm"
      meta={[
        { name: 'description', content: 'Sample' },
        { name: 'keywords', content: 'sample, something' },
      ]}
    />

    <Navigation />

    <main>
      { children() }
    </main>

    <Footer />
  </div>
)

PageWrapper.propTypes = {
  children: PropTypes.func,
}

export default PageWrapper
