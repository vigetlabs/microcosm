import React from 'react'
import Link from 'gatsby-link'

const IndexPage = () => (
  <section>
    <div className="wrapper">
      <h1>
        <span>01.</span>
        Rendering a View
      </h1>

      <div className="figure-container">
        <figure className="figure -left">
          <img src="" className="figure__graphic" alt="TODO" />
          <figcaption className="figure__content">
            <h2 className="figure__content__header">In the browser</h2>
            <p className="figure__content__text">A user fires up the browser to take a quiz.</p>
          </figcaption>
        </figure>

        <figure className="figure -right">
          <img src="" className="figure__graphic" alt="TODO" />
          <figcaption className="figure__content">
            <h2 className="figure__content__header">In Microcosm</h2>
            <p className="figure__content__text">The <a href="TODO">Domains</a> are in charge of keeping state organized, and provide whatever data is necessary to the Presenter. A Presenter at it's core is a React Component, so it uses the data it pulls from the Domains to render the appropriate view.</p>
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
)

export default IndexPage
