export default function Collection (defaults) {

  function add (list, params) {
    return list.concat(Object.assign({}, defaults, params))
  }

  function remove (list, unwanted) {
    return list.filter(i => i.id !== unwanted)
  }

  function removeBy (key) {
    return (list, unwanted) => list.filter(i => i[key] !== unwanted)
  }

  return {
    add,
    remove,
    removeBy,

    getInitialState() {
      return []
    }
  }
}
