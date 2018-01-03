const key = '__MICROCOSM_DEVTOOLS_GLOBAL_HOOK__'

export default function installDevtools(repo) {
  let namespace =
    typeof global === 'undefined' ? /* istanbul ignore next */ window : global
  let hook = namespace[key]

  if (hook) {
    hook.emit('init', repo)
  }
}
