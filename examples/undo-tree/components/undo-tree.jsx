import React from 'react'
import Tree  from 'paths-js/tree'

const UndoTree = React.createClass({

  getTree(history) {
    return Tree({
      data   : history.tree(),
      height : 360,
      width  : 760
    })
  },

  getCurve(curve, i) {
    return (<path key={ i } d={ curve.connector.path.print() } />)
  },

  getNode(node, i) {
    let { point, item } = node

    let isFocused = this.props.history.focus === item.node

    return (<circle key={ i }
                    r={ isFocused? 7 : 5 }
                    fill={ isFocused? '#e39' : 'black' }
                    cx={ point[0] }
                    cy={ point[1] }
                    onClick={ () => this.props.onNodeClick(item.node) } />)
  },

  render() {
    let tree = this.getTree(this.props.history)

    return (
      <svg width="800" height="400">
        <g transform="translate(20, 20)">
          <g fill="none" stroke="rgba(0, 0, 0, 0.5)">
            { tree.curves.map(this.getCurve) }
          </g>
          <g fill="black">
            { tree.nodes.map(this.getNode) }
          </g>
        </g>
      </svg>
    )
  }

})

export default UndoTree
