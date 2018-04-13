import { get, merge } from 'microcosm'
import axios, { CancelToken } from 'axios'

function trackUploads(action) {
  return progressEvent => {
    const { loaded, total, lengthComputable } = progressEvent

    if (lengthComputable) {
      action.next({
        uploading: true,
        downloading: false,
        loaded: loaded,
        total: total,
        progress: loaded / total
      })
    }
  }
}

function trackDownloads(action) {
  return progressEvent => {
    const { loaded, total, lengthComputable } = progressEvent

    if (lengthComputable) {
      action.next({
        uploading: false,
        downloading: true,
        loaded: loaded,
        total: total,
        progress: loaded / total
      })
    }
  }
}

function formatErrors(error) {
  return {
    status: get(error, 'response.status', 400),
    data: get(error, 'response.data', null),
    message: get(error, 'message', 'Client error')
  }
}

export default function http(args) {
  return action => {
    let source = CancelToken.source()

    // https://github.com/mzabriskie/axios#request-config
    let options = merge(args, {
      cancelToken: source.token,
      onUploadProgress: trackUploads(action),
      onDownloadProgress: trackDownloads(action)
    })

    axios(options)
      .then(response => {
        action.next(response.data)
        action.complete()
      })
      .catch(error => {
        action.error(formatErrors(error))
      })

    action.subscribe({ cancel: source.cancel })
  }
}

http.prepare = function(defaults) {
  return overrides => http(merge(defaults, overrides))
}
