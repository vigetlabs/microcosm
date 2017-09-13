import React from 'react'
import Tree from 'paths-js/tree'
import Node from './node'
import css from './tree.css'

class TreeVisual extends React.Component {
  static defaultProps = {
    height: 250,
    width: 350,
    spacing: 40
  }

  constructor(props) {
    super(props)

    this.state = {
      width: props.width,
      height: props.height
    }
  }

  _width = 0

  componentDidMount() {
    this.recalculateDimensions()

    window.addEventListener('resize', this.recalculateDimensions)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.recalculateDimensions)
  }

  recalculateDimensions = () => {
    if (this.frame) {
      this.setState({
        width: this.frame.offsetWidth,
        height: this.frame.offsetHeight
      })
    }
  }

  get width() {
    const { history } = this.props

    let lengths = history.list.map(function(action) {
      return action.type.length * 3
    })

    let longestAction = Math.max(20, ...lengths)

    this._width = Math.max(this._width, history.size * longestAction)

    return this._width
  }

  componentDidUpdate(component) {
    let active = document.querySelector('#node-' + this.props.history.head)

    if (active) {
      active.scrollIntoView(true, { behavior: 'smooth', block: 'end' })
    }
  }

  getTree(history) {
    return Tree({
      data: history.tree,
      height: this.state.height - this.props.spacing * 2,
      width: this.width
    })
  }

  getCurve(curve, i) {
    return (
      <path key={i} d={curve.connector.path.print()} strokeDasharray="2 2" />
    )
  }

  getNode({ point, item }, i) {
    const { head } = this.props.history

    let [x = 0, y = 0] = point

    return <Node key={i} index={i} x={x} y={y} action={item} head={head} />
  }

  render() {
    const { history } = this.props
    const { height } = this.state

    // Leave plenty of room for labels
    let width = this.width + 200

    return (
      <div className={css.container} ref={el => (this.frame = el)}>
        <svg className={css.graphic} width={width} height={height}>
          {history.size > 0 ? this.renderTree() : this.renderEmpty()}
        </svg>
      </div>
    )
  }

  renderEmpty() {
    return <p>No events recieved. Dev tools are waiting...</p>
  }

  renderTree() {
    const { history, spacing } = this.props

    let tree = this.getTree(history)

    return (
      <g transform={`translate(0, ${spacing})`}>
        <g fill="none" stroke="rgba(125, 225, 255, 0.4)">
          {tree.curves.map(this.getCurve)}
        </g>
        {tree.nodes.map(this.getNode, this)}
      </g>
    )
  }
}

export default TreeVisual
