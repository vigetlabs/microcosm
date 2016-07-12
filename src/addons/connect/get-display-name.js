/**
 * Run through the various ways to get a React Component's display
 * name.
 *
 * @private
 * @param {React.Component} Component - A react component
 * @return {String} The name of the given component, or "Component"
 */
export default function getDisplayName (Component) {
  return Component.displayName || Component.name || 'Component'
}
