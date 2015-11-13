import Assets      from './assets'
import Home        from './home'
import ChatBot     from '../../apps/chatbot/server'
import ReactRouter from '../../apps/react-router/server'
import SimpleSVG   from '../../apps/simple-svg/server'
import UndoTree    from '../../apps/undo-tree/server'
import Handlebars  from 'handlebars'
import Hapi        from 'hapi'
import Vision      from 'vision'
import { resolve } from 'path'

const PLUGINS = [
  Vision,
  Home,
  Assets,
  ChatBot,
  ReactRouter,
  SimpleSVG,
  UndoTree
]

export function start (port, next) {
  const server = new Hapi.Server()

  server.connection({ port })

  server.register(PLUGINS, function (error) {
    if (error) {
      return next(error, server)
    }

    server.views({
      engines: {
        html: Handlebars
      },
      isCached: process.env.NODE_ENV === 'production',
      relativeTo: resolve(__dirname, '../..')
    })

    server.start(function (error) {
      next(error, server)
    })
  })
}
