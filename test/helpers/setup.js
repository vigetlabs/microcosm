import '../../src/addons/jest-matchers'
import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'

configure({ adapter: new Adapter() })

// Make a strict-only test flag
it.dev = function(...args) {
  if (!process.env.NO_ASSERTS) {
    return it(...args)
  }

  return it.skip(...args)
}

describe.dev = function(...args) {
  if (!process.env.NO_ASSERTS) {
    return describe(...args)
  }

  return describe.skip(...args)
}
