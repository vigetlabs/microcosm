/**
 * @flow
 */

type Collection = Array<Object>
type Record = Object

class Domain {
  getInitialState(): Collection {
    return []
  }

  add(items: Collection, params: Record) {
    return items.concat(params)
  }

  remove(items: Collection, unwanted: string) {
    return items.filter(i => i.id !== unwanted)
  }

  removeBy(key: string) {
    return (items: Collection, value: *) => {
      return items.filter(item => item[key] !== value)
    }
  }
}

export default Domain
