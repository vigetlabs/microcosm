import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Link from 'gatsby-link'
import Helmet from 'react-helmet'
import { VigetLogo, microcosmLogo } from '../images'
import '../stylesheets/app.scss'

const isBrowser = typeof window !== 'undefined'

if (isBrowser) {
  require('intersection-observer') //IntersectionObserver polyfill
  require('lazysizes') //lazy loading images
}

class Navigation extends Component {
  constructor(props) {
    super(props)

    this.state = {
      hidden: true
    }
  }

  handleHamburger = () => {
    const { hidden } = this.state

    this.setState({
      hidden: !hidden
    })
  }

  closeHamburger = () => {
    this.setState({
      hidden: true
    })
  }

  render() {
    const { hidden } = this.state

    return (
      <nav onMouseLeave={this.closeHamburger} className="navigation">
        <div className="wrapper">
          <h1>
            <span className="screenreader-only">Microcosm</span>
            <img src={microcosmLogo} alt="" />
          </h1>

          <button
            onClick={this.handleHamburger}
            aria-controls="menu"
            className="hamburger"
          >
            Open Navigation
          </button>
          <ul
            id="menu"
            aria-hidden={hidden || null}
            className="hamburger-dropdown"
          >
            <li>
              <a
                href="http://code.viget.com/microcosm/guides/quickstart.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                Microcosm Guides
              </a>
            </li>
            <li>
              <a
                href="http://code.viget.com/microcosm/api/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Microcosm API
              </a>
            </li>
            <li>
              <a
                href="https://github.com/vigetlabs/microcosm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Microcosm Github
              </a>
            </li>
          </ul>
        </div>
      </nav>
    )
  }
}

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
      link={[
        {
          rel: 'icon',
          href: '/favicon.ico',
          type: 'image/x-icon'
        }
      ]}
      meta={[
        {
          name: 'og:title',
          content: 'Welcome to Microcosm'
        },
        {
          name: 'og:description',
          content:
            'Microcosm is Flux with actions at center stage. Write optimistic updates, cancel requests, and track changes with ease.'
        },
        {
          name: 'og:image',
          content: 'http://code.viget.com/microcosm/asset.png'
        }
      ]}
    />

    <Navigation />

    {children()}

    <Footer />
  </div>
)

PageWrapper.propTypes = {
  children: PropTypes.func
}

export default PageWrapper
