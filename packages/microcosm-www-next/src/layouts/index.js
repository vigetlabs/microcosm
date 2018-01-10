import React from 'react'
import PropTypes from 'prop-types'
import Link from 'gatsby-link'
import Helmet from 'react-helmet'
import { menu, VigetLogo, microcosmLogo } from '../images'
import '../stylesheets/app.scss'

const isBrowser = typeof window !== 'undefined'

if (isBrowser) {
  require('intersection-observer') //IntersectionObserver polyfill
  require('lazysizes') //lazy loading images
}

const Navigation = () => (
  <nav className="navigation">
    <div className="wrapper">
      <h1>
        <span className="screenreader-only">Microcosm</span>
        <img src={microcosmLogo} alt="" />
      </h1>

      <img src={menu} alt="menu" />
    </div>
  </nav>
)

const Footer = () => (
  <footer className="footer">
    <div className="wrapper">
      <Link to="https://www.viget.com/" className="viget-logo" target="_blank">
        <VigetLogo />
      </Link>

      <Link
        className="footer__cta"
        target="_blank"
        to="http://code.viget.com/microcosm/"
      >
        Learn more at code.viget.com/microcosm
      </Link>
    </div>
  </footer>
)

const PageWrapper = ({ children }) => (
  <div>
    <Helmet
      title="Microcosm"
      meta={[
        { name: 'description', content: 'Sample' },
        { name: 'keywords', content: 'sample, something' }
      ]}
    />

    <Navigation />

    <main>{children()}</main>

    <Footer />
  </div>
)

PageWrapper.propTypes = {
  children: PropTypes.func
}

export default PageWrapper
