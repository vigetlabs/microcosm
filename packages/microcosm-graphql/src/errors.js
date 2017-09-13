export function badOneToMany(key, one, many) {
  throw new Error(
    `Unable to resolve ${one}.${key}. Add a field to ${many} with a type of ${one}:\n\n` +
      `  type ${many} {\n` +
      `    ${one.toLowerCase()}: ${one}\n` +
      `  }`
  )
}
