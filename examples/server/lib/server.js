import Assets      from './assets'
import ChatBot     from '../../apps/chatbot/server'
import H2O2        from 'h2o2'
import Hapi        from 'hapi'
import Home        from './home'
import Mustache    from 'mustache'
import ReactRouter from '../../apps/react-router/server'
import SimpleSVG   from '../../apps/simple-svg/server'
import UndoTree    from '../../apps/undo-tree/server'
import Vision      from 'vision'
import { resolve } from 'path'

const PLUGINS = [
  Vision,
  H2O2,
  Assets,
  Home,
  { register: ChatBot,     routes: { prefix: '/chat-bot' } },
  { register: ReactRouter, routes: { prefix: '/react-router' } },
  { register: SimpleSVG,   routes: { prefix: '/simple-svg' } },
  { register: UndoTree,    routes: { prefix: '/undo-tree' } }
]

export function start (port, next) {
  const server = new Hapi.Server()

  server.connection({ port })

  // Dead simple logging
  server.on('response', function (request) {
    console.log('[info]',
                request.method.toUpperCase(),
                request.response.statusCode,
                request.url.path,
                '(' + (request.info.responded - request.info.received) + 'ms' + ')')
  })

  server.register(PLUGINS, function (error) {
    if (error) {
      return next(error, server)
    }

    server.views({
      engines: {
        html: {
          compile(template) {
            // Optional, speeds up future use
            Mustache.parse(template)

            return function (context) {
              return Mustache.render(template, context)
            }
          }
        }
      },
      relativeTo: resolve(__dirname, '../..')
    })

    server.start(function (error) {
      next(error, server)
    })
  })
}
