import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import '../src/addons/jest-matchers'

configure({ adapter: new Adapter() })

jest.setTimeout(1000)

// Make a strict-only test flag
it.dev = function(description, test) {
  if (!process.env.BUNDLED) {
    return it(description, test)
  }

  return it.skip(description, test)
}

describe.dev = function(description, suite) {
  if (!process.env.BUNDLED) {
    return describe(description, test)
  }

  return describe.skip(description, test)
}
