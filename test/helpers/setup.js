import '../../src/addons/jest-matchers'

// Make a strict-only test flag
it.strict = function (description, test) {
  if (!process.env.NO_ASSERTS) {
    return it(description, test)
  }

  return it.skip(description, test)
}
