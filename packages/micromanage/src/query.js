import assert from 'assert'

export function query(rules) {
  let ruleKeys = Object.keys(rules)

  return (repo, props, state) => {
    return ruleKeys.reduce((answer, key) => {
      assert(repo.domains[key], `Unable to locate domain for "${key}".`)

      let rule = rules[key]
      let props = Object.keys(rule)

      answer[key] = repo.domains[key].map(values => {
        return Object.values(values).map(record => {
          let partial = { _id: record._id, _type: record._type }

          props.forEach(propName => {
            let params = rule[propName] || []
            let prop = record[propName]

            assert(
              prop,
              `Unable to query "${key}" for Entity "${record._type}"`
            )

            partial[propName] =
              typeof prop === 'function'
                ? prop.call(record, repo, params)
                : prop
          })

          return partial
        })
      })

      return answer
    }, {})
  }
}
