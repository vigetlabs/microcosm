class Domain {
  getInitialState() {
    return []
  }

  add(items, params) {
    return items.concat(params)
  }

  remove(items, unwanted) {
    return items.filter(i => i.id !== unwanted)
  }

  removeBy(key) {
    return (items, value) => {
      return items.filter(item => item[key] !== value)
    }
  }
}

export default Domain
