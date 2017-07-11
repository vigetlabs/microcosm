export default function installDevtools(repo) {
  let hook = global.__MICROCOSM_DEVTOOLS_GLOBAL_HOOK__

  if (hook) {
    hook.emit('init', repo)

    repo.history.setLimit(Infinity)
  }
}
