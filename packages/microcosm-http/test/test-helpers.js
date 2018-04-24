import settle from 'axios/lib/core/settle'

const defaults = {
  data: {},
  status: 200,
  uploads: [],
  downloads: []
}

export function testAdapter(mock) {
  let options = { ...defaults, ...mock }

  return function adapter(config) {
    let response = { ...options, config }

    return new Promise(function(resolve, reject) {
      // Emit a progress event for each item in a given array of
      // downloads/uploads. This is an object matching the progress
      // event api:
      // https://developer.mozilla.org/en-US/docs/Web/API/ProgressEvent
      options.downloads.forEach(config.onDownloadProgress)
      options.uploads.forEach(config.onUploadProgress)

      // Wait a bit to simulate asynchronous behavior.
      let timer = setTimeout(() => settle(resolve, reject, response))

      // Handle cancellation
      // https://github.com/axios/axios#cancellation
      if (config.cancelToken) {
        config.cancelToken.promise.then(() => clearTimeout(timer))
      }
    })
  }
}
