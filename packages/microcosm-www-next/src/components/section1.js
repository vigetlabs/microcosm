import React from 'react'

const Section1 = ({ fill }) => (
  <figure className="figure -right" id="section1" data-module="ObserveSection">
    <img src="" className="figure__graphic" alt="TODO" />
    <figcaption className="figure__content">
      <h3 className="figure__content__header">In Microcosm</h3>
      <p className="figure__content__text">
        The <a href="TODO">Domains</a> are in charge of keeping state
        organized, and provide whatever data is necessary to the
        Presenter. A Presenter at it's core is a React Component, so it
        uses the data it pulls from the Domains to render the appropriate
        view.
      </p>
    </figcaption>
  </figure>
)

export default Section1
