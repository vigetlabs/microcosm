import React from 'react'
import data from '../data/index.json';
import { Graphic1, Graphic2 } from '../components';

export default class IndexPage extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // do accessibility to alert to change!!!!
    this.minThreshold = 0.6;
    this.lastIntersectingEntry = null;
    this.sectionHeading = document.getElementById('section__content__heading');
    let graphics = document.querySelectorAll('[data-module="ObserveGraphic"]');

    this.beginObserve(graphics);
  }

  beginObserve(graphics) {
    //create new Observer instance
    let observer = new IntersectionObserver(this.onChange, {threshold: this.minThreshold});

    //start observing each graphic
    graphics.forEach(graphic => observer.observe(graphic));
  }

  onChange = (observed) => {
    let entry = observed[0];
    let targetElement = entry.target;
    let isIntersecting = entry.intersectionRatio > this.minThreshold;
    let notAlreadyVisible = targetElement !== this.lastIntersectingEntry;

    if (isIntersecting && notAlreadyVisible) {
      this.sectionHeading.innerHTML = data[targetElement.id].heading;
      this.lastIntersectingEntry = targetElement;
    }
  }

  render() {
    return (
      <div className="wrapper">
        <section className="section">
          <div className="section__content">
            <h2 className="section__content__heading" id="section__content__heading">
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
            <Graphic1 />
            <Graphic2 />
          </div>
        </section>
      </div>
    );
  }
}
