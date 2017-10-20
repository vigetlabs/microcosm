/**
 * Arguments
 * https://facebook.github.io/graphql/#sec-Language.Arguments
 * @flow
 */

import { reduceName } from './utilities'

function parseArgument(arg: Argument, _name: string, variables: Variables): * {
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

// Sharing an "empty" arguments object makes hashing easier
const EMPTY = {}
export function parseArguments(args: ?(Arguments[]), variables: Variables): * {
  if (!args || args.length <= 0) {
    return EMPTY
  }

  return reduceName(args, parseArgument, variables)
}
