import React from 'react/addons'

let { cloneWithProps } = React.addons

export default function query (children, stores) {
  return React.Children.map(children, Component => {
    let { query } = Component.type
    return cloneWithProps(Component, query ? query(stores) : null)
  })
}
