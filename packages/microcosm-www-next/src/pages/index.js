import React from 'react'
import data from '../data/index.json';
import { Graphic1, Graphic2 } from '../components';

export default class IndexPage extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // TODO - accessibility to alert on change
    this.setVars();
    this.beginObserve();
  }

  setVars() {
    this.onMicrocosmView = true;
    this.currentSection = 1;
    this.minThreshold = 0.6;
    this.text = document.getElementById('text');
    this.heading = document.getElementById('heading');
    this.subheadingTop = document.getElementById('subheading-top');
    this.subheadingBottom = document.getElementById('subheading-bottom');

    let graphics = document.querySelectorAll('[data-module="ObserveGraphic"]');
    this.graphicsMap = this.setGraphicsMap(graphics);
  }

  setGraphicsMap(graphics) {
    return [].slice.call(graphics).reduce((map, graphic) => {
      map[graphic.dataset.section] = graphic;
      return map;
    }, {})
  }

  beginObserve() {
    //create new Observer instance
    let observer = new IntersectionObserver(this.onIntersection, {threshold: this.minThreshold});

    //start observing each graphic
    Object.values(this.graphicsMap).forEach(graphic => observer.observe(graphic));
  }

  onIntersection = (observed) => {
    let entry = observed[0];
    let section = entry.target.dataset.section;
    let isIntersecting = entry.intersectionRatio > this.minThreshold;
    let notAlreadyVisible = section !== this.currentSection;

    if (isIntersecting && notAlreadyVisible) {
      this.currentSection = section;
      this.changeHeading();
      this.changeText();
      this.changeGraphic();
    }
  }

  changeHeading() {
    let sectionData = data[this.currentSection];
    this.heading.innerHTML = sectionData.heading;
  }

  changeText() {
    let sectionData = data[this.currentSection];
    this.text.innerHTML = this.onMicrocosmView ? sectionData.microcosmText : sectionData.browserText;
  }

  changeGraphic() {
    let section = this.currentSection;
    let graphicElement = this.graphicsMap[section];
    let newGraphicUrl = this.onMicrocosmView ? data[section].microcosmGraphicUrl : data[section].browserGraphicUrl

    graphicElement.setAttribute('src', newGraphicUrl);
  }

  changeButtonText(button) {
    button.classList.toggle('-browserView', !this.onMicrocosmView);
  }

  changeSubheadingText(button) {
    this.subheadingTop.classList.toggle('-browserView', !this.onMicrocosmView);
    this.subheadingBottom.classList.toggle('-browserView', !this.onMicrocosmView);
  }

  switchView = (e) => {
    this.onMicrocosmView = !this.onMicrocosmView;

    this.changeGraphic();
    this.changeSubheadingText();
    this.changeText();
    this.changeButtonText(e.target);
  }

  render() {
    return (
      <div className="wrapper">
        <section className="section">
          <div className="section__content">
            <h2 className="section__content__heading" id="heading">
              <span>01.</span>
              Rendering a View
            </h2>

            <h3 className="section__content__subheading -top" id="subheading-top">In</h3>
            <p className="section__content__text" id="text">
              The <a href="TODO">Domains</a> are in charge of keeping state
              organized, and provide whatever data is necessary to the
              Presenter. A Presenter at it's core is a React Component, so it
              uses the data it pulls from the Domains to render the appropriate
              view.
            </p>

            <h3 className="section__content__subheading -bottom" id="subheading-bottom">Meanwhile, in</h3>
            <button className="section__browser-btn" onClick={this.switchView}></button>
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
