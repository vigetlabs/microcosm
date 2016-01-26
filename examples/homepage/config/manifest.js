var path = require('path')

exports.server = {
  connections: [{
    port : process.env.PORT || 4000
  }],

  plugins: {
    'h2o2': {},

    'inert': {},

    'vision': {},

    'visionary': {
      engines: {
        html: require('handlebars')
      },
      relativeTo: path.resolve(__dirname, '../..'),
      isCached: process.env.NODE_ENV !== 'development'
    },

    'good': {
      reporters: [{
        reporter: require('good-console'),
        events: { "response": "*", "log": "*", "error": "*" }
      }]
    },

    './lib/home': {},

    './lib/assets': [{
      routes: { prefix: '/assets' }
    }],

    '../chatbot': [{
      routes: { prefix: '/chat-bot' }
    }],

    '../simple-svg': [{
      routes: { prefix: '/simple-svg' }
    }],

    '../react-router': [{
      routes: { prefix: '/react-router' }
    }],

    '../painter': [{
      routes: { prefix: '/painter' }
    }]
  }
}

exports.options = {
  // When requiring first-party modules, what
  // base directory should Hapi use?
  relativeTo : path.resolve(__dirname, '..')
}
