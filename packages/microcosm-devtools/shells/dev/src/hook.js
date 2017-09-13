import { installHook, hasHook } from 'src/backend/hook'

if (hasHook(window) === false) {
  installHook(window)
}
