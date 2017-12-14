import React from 'react'
import data from '../data/index.json';
import { Section1, Section2 } from '../components';

export default class IndexPage extends React.Component {
  constructor(props) {
    super(props);
  }

  // componentDidMount() {
  //   this.leftFigure = document.getElementsByClassName('figure__content__text')[0];
  //   let sections = document.querySelectorAll('[data-module="ObserveSection"]');

  //   //create new Observer instance
  //   let observer = new IntersectionObserver(this.onChange.bind(this), {threshold: 0.6});

  //   //start observing each section
  //   sections.forEach(section => observer.observe(section));
  // }

  // onChange(observed) {
  //   let entry = observed[0];

  //   if (entry.isIntersecting) {
  //     this.leftFigure.innerHTML = data[entry.target.id].browserText;
  //   }
  // }

  render() {
    return (
      <div className="wrapper">
        <Section1 />
      </div>
    );
  }
}
