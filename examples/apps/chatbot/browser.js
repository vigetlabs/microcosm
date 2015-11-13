import ChatBot from './app/chatbot'
import Render  from './app/plugins/render'
import Hydrate from './app/plugins/hydrate'

let app = new ChatBot()

app.addPlugin(Hydrate, 'CHAT_BOT_SEED')
app.addPlugin(Render, document.getElementById('app'))

app.start()
