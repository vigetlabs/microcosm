// Place setup behavior here
// Force sync rendering in Preact
import { options } from 'preact'

options.debounceRendering = update => update()
