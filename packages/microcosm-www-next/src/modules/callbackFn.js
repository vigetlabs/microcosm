
export default (inView, leftFigure, section) => {
  console.log('Inview:', inView);

  if (inView) {
    leftFigure.innerHTML = 'hihi';
    console.log(section.dataset.hello)
  }
}

