// Thanks: https://github.com/jurassix/react-display-name
export default function (Component) {
  return Component.displayName || Component.name || 'Component'
}
