import Microcosm from 'Microcosm'

export default function(props, propName, componentName) {
  if (props[propName] instanceof Microcosm === false) {
    throw new Error(`Context type ${ propName } of <${componentName}> should be an instance of Microcosm`)
  }
}
