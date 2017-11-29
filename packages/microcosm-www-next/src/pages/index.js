import React from 'react'
import Section1 from '../components/section1';
import Section2 from '../components/section2';
import Observer from 'react-intersection-observer';

import callBackFn from '../modules/callbackFn';

// const IndexPage = () => (

//   <div className="wrapper">

//     <div className="col-left">
//       {/* <h2 className="section-title">
//         <span>01.</span>
//         Rendering a View
//       </h2> */}
//       <figure className="figure -left">
//         <img src="" className="figure__graphic" alt="TODO" />
//         <figcaption className="figure__content">
//           <h3 className="figure__content__header">In the browser</h3>
//           <p className="figure__content__text">
//             A user fires up the browser to take a quiz.
//           </p>
//         </figcaption>
//       </figure>
//     </div>

//     <div className="col-right">
//       <Section1 />
//       <Section2 />
//     </div>
//   </div>


// )

export default class IndexPage extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.leftFigure = document.getElementsByClassName('figure__content__text')[0];
  }

  componentWillUnmount() {

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
              <p className="figure__content__text">
                A user fires up the browser to take a quiz.
              </p>
            </figcaption>
          </figure>
        </div>

        <div className="col-right">
          <Section1 />
          <Observer onChange={(inView) => callBackFn(inView, this.leftFigure, Section2)}>
            <Section2 />
          </Observer>

        </div>
      </div>
    );
  }
}


// When a new section is appearing, we want it to trigger the Intersection IntersectionObserver. After trigger, it will grab and change the figure on the left
