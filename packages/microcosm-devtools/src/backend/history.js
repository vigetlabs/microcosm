export function trackHistory(hook, bridge) {
  const repo = hook.repo
  const history = repo.history

  history.toArray().forEach(function(action) {
    registerAction(bridge, repo, action)
  })

  history.on('append', function(action) {
    registerAction(bridge, repo, action)
  })

  history.on('remove', function(action) {
    deregisterAction(bridge, action)
  })

  history.on('reconcile', function() {
    bridge.send('history:reconcile', history)
  })

  history.on('release', function() {
    bridge.send('history:release', repo.state)
  })

  // Force a change to trigger the process
  repo.checkout()
}

function registerAction(bridge, repo, action) {
  const history = repo.history

  deregisterAction(bridge, action)

  bridge.on(`toggle:${action.id}`, () => {
    history.toggle(action)
    // if toggling an inactive action, history won't reconcile
    // we still want to know what history looks like though
    bridge.send('history:reconcile', history)
  })

  bridge.on(`remove:${action.id}`, () => {
    history.remove(action)
    bridge.send('history:reconcile', history)
  })

  bridge.on(`checkout:${action.id}`, () => history.checkout(action))

  bridge.on('revert', () => {
    history.root.children = []
    history.checkout(history.root)
  })

  bridge.on('commit', () => {
    action = history.append('commit', 'resolve')
    history.root = action

    history.checkout(action)
  })

  bridge.on(`detail:${action.id}`, () => {
    bridge.send('snapshot', repo.recall(action))
  })
}

function deregisterAction(bridge, action) {
  bridge.removeAllListeners(`toggle:${action.id}`)
  bridge.removeAllListeners(`remove:${action.id}`)
  bridge.removeAllListeners(`checkout:${action.id}`)
  bridge.removeAllListeners(`detail:${action.id}`)
}
