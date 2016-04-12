import uid from 'uid'

function Message ({ message, user, error=false, pending=false, time=new Date() }) {
  return { id: uid(), message, user, error, pending, time }
}

export default Message
