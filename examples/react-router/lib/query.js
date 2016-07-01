const Query = {

  all (type) {
    return state => state[type] || []
  },

  get(type, id) {
    const getAll = Query.all(type)

    return state => getAll(state).filter(item => item.id === id).pop()
  },

  where (type, key, value) {
    const getAll = Query.all(type)

    return state => getAll(state).filter(item => item[key] == value)
  },

  count (type, child, key) {
    const getAll = Query.all(type)

    return function (state) {

      return getAll(state).reduce(function (counts, parent) {
        counts[parent.id] = Query.where(child, key, parent.id)(state).length
        return counts
      }, {})
    }
  }

}

export default Query
