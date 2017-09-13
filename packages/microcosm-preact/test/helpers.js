import { render } from 'preact'

export function unmount (el) {
  return render('', el, el)
}

export function mount (...args) {
  return render(...args)
}

export function remount(component, el) {
  return mount(component, el, el.firstChild)
}
