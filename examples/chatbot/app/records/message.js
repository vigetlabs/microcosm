import uid from 'uid'

function Message ({ message, user, pending=false, time=new Date() }) {
  return { id: uid(), message, user, pending, time }
}

export default Message
