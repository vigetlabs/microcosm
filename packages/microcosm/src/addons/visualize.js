export default function visualize(history) {
  function dig(focus, edges) {
    return edges.has(focus)
      ? [focus.tag, dig(edges.get(focus), edges)]
      : focus.tag
  }

  console.log(require('asciitree')(dig(history.root, history._forwards)))
}
