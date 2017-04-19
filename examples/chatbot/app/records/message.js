import uid from 'uid'

function Message ({
  id = uid(),
  message,
  user,
  error = false,
  pending = false,
  time = new Date(),
}) {
  return { id, message, user, error, pending, time }
}

export default Message
