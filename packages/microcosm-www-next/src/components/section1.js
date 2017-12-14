import React from 'react'

const Section1 = ({ fill }) => (
  <section className="section">
    <div className="section__content">
      <h2 className="section__content__heading">
        <span>01.</span>
        Rendering a View
      </h2>

      <h3 className="section__content__subheading">In Microcosm</h3>
      <p className="section__content__text">
        The <a href="TODO">Domains</a> are in charge of keeping state
        organized, and provide whatever data is necessary to the
        Presenter. A Presenter at it's core is a React Component, so it
        uses the data it pulls from the Domains to render the appropriate
        view.
      </p>

      <h3 className="section__content__subheading">Meanwhile, in the browser...</h3>
    </div>

    <div className="section__graphic">
      <figure className="section__graphic__figure">
        <img src="" alt="TODO - image" />
      </figure>
    </div>
  </section>



  // <figure className="figure -right" id="section1" data-module="ObserveSection">
  //   <img src="" className="figure__graphic" alt="TODO" />
  //   <figcaption className="figure__content">
  //     <h3 className="figure__content__header">In Microcosm</h3>
  //     <p className="figure__content__text">
  //       The <a href="TODO">Domains</a> are in charge of keeping state
  //       organized, and provide whatever data is necessary to the
  //       Presenter. A Presenter at it's core is a React Component, so it
  //       uses the data it pulls from the Domains to render the appropriate
  //       view.
  //     </p>
  //   </figcaption>
  // </figure>
)

export default Section1
