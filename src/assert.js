/**
 * assert
 * If not true, throw an error
 */

export default function assert (bool, message) {
  if (!bool) {
    let error = new Error(message)

    // Remove `assert` from the stack
    error.framesToPop = 1;

    throw error
  }
}
