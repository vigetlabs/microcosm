export function send({ message }) {
  var request = new XMLHttpRequest()

  return function(action) {
    request.addEventListener('readystatechange', function() {
      switch (request.readyState) {
        // Open
        case 1:
          return action.open({ user: 'You', message })
        // Complete
        case 4:
          return action.resolve(JSON.parse(request.responseText))

        default:
          return null
      }
    })

    request.addEventListener('error', function() {
      action.reject(JSON.parse(request.responseText))
    })

    request.open('POST', '/message')

    request.setRequestHeader('Accept', 'application/json')
    request.setRequestHeader('Content-Type', 'application/json')

    request.send(JSON.stringify({ message }))
  }
}

export function receive(message) {
  return message
}
