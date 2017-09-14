// Place setup behavior here
// Force sync rendering in Preact
const { options } = require('preact')

options.debounceRendering = update => update()
