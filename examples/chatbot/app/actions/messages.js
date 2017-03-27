export function send ({ message }) {
  var request = new XMLHttpRequest()

  return function (task) {
    request.addEventListener('readystatechange', function() {
      switch (request.readyState) {

        // Open
        case 1:
          return task.open({ user: 'You', message })

        // Complete
        case 4:
          return task.resolve(JSON.parse(request.responseText))

        default:
          return null
      }
    })

    request.addEventListener('error', function() {
      task.reject(JSON.parse(request.responseText))
    })

    request.open('POST', '/message')

    request.setRequestHeader('Accept', 'application/json')
    request.setRequestHeader('Content-Type', 'application/json')

    request.send(JSON.stringify({ message }))
  }
}

export function receive (message) {
  return message
}
