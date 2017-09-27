/**
 * Arguments
 * https://facebook.github.io/graphql/#sec-Language.Arguments
 */

import { reduceName } from './utilities'

function parseArgument(arg, _name, variables) {
  // Input values:
  // https://facebook.github.io/graphql/#sec-Input-Values
  switch (arg.value.kind) {
    case 'Variable':
      // TODO: Default values:
      // http://graphql.org/learn/queries/#default-variables
      return variables[arg.value.name.value]
    case 'IntValue':
    case 'FloatValue':
    case 'BooleanValue':
      return JSON.parse(arg.value.value)
    default:
      return arg.value.value
  }
}

const NO_ARGS = {}

export function emptyArgs(args) {
  return args === NO_ARGS
}

export function parseArguments(args, variables) {
  if (args.length <= 0) {
    return NO_ARGS
  }

  return reduceName(args, parseArgument, variables)
}
