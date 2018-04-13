import settle from 'axios/lib/core/settle'
import createError from 'axios/lib/core/createError'

const defaults = {
  data: {},
  delay: 100,
  status: 200,
  uploads: [],
  downloads: []
}

export function testAdapter(mock) {
  let options = { ...defaults, ...mock }

  return function adapter(config) {
    let response = { ...options, config }

    return new Promise(function(resolve, reject) {
      // Handle cancellation
      // https://github.com/axios/axios#cancellation
      if (config.cancelToken) {
        config.cancelToken.promise.then(reject)
      }

      if (response.status >= 400) {
        reject(createError('Mock request failure', config, 'MOCKFAILED', {}))
      }

      // Emit a progress event for each item in a given array of
      // downloads/uploads. This is an object matching the progress
      // event api:
      // https://developer.mozilla.org/en-US/docs/Web/API/ProgressEvent
      options.downloads.forEach(config.onDownloadProgress)
      options.uploads.forEach(config.onUploadProgress)

      // Wait a bit to simulate asynchronous behavior.
      setTimeout(() => settle(resolve, reject, response), mock.delay)
    })
  }
}

export function delay(time = 0) {
  return new Promise(resolve => setTimeout(resolve, time))
}
