import '../../src/addons/jest-matchers'

// Make a strict-only test flag
it.dev = function (description, test) {
  if (!process.env.NO_ASSERTS) {
    return it(description, test)
  }

  return it.skip(description, test)
}

describe.dev = function (description, suite) {
  if (!process.env.NO_ASSERTS) {
    return describe(description, test)
  }

  return describe.skip(description, test)
}
