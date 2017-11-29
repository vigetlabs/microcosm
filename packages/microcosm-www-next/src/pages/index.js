import React from 'react'
import data from '../data/index.json';
import { Section1, Section2 } from '../components';

export default class IndexPage extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.leftFigure = document.getElementsByClassName('figure__content__text')[0];
    let sections = document.querySelectorAll('[data-module="ObserveSection"]');

    //create new Observer instance
    let observer = new IntersectionObserver(this.onChange.bind(this), {threshold: 0.6});

    //start observing each section
    sections.forEach(section => observer.observe(section));
  }

  onChange(observed) {
    let entry = observed[0];

    if (entry.isIntersecting) {
      this.leftFigure.innerHTML = data[entry.target.id].browserText;
    }
  }

  render() {
    return (
      <div className="wrapper">
        <div className="col-left">
          {/* <h2 className="section-title">
            <span>01.</span>
            Rendering a View
          </h2> */}
          <figure className="figure -left">
            <img src="" className="figure__graphic" alt="TODO" />
            <figcaption className="figure__content">
              <h3 className="figure__content__header">In the browser</h3>
              <p className="figure__content__text"></p>
            </figcaption>
          </figure>
        </div>

        <div className="col-right">
          <Section1 />
          <Section2 />
        </div>
      </div>
    );
  }
}
