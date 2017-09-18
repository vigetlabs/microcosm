import { get, merge } from 'microcosm'
import axios, { CancelToken } from 'axios'

function trackUploads(action) {
  return progressEvent => {
    const { loaded, total, lengthComputable } = progressEvent

    if (lengthComputable) {
      action.update({
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
      action.update({
        uploading: false,
        downloading: true,
        loaded: loaded,
        total: total,
        progress: loaded / total
      })
    }
  }
}

export default function createAction(defaults) {
  return function httpAction(overrides) {
    return function(action) {
      let source = CancelToken.source()
      let options = merge(defaults, overrides)

      action.open(options)

      let request = axios({
        // https://github.com/mzabriskie/axios#request-config
        ...options,
        cancelToken: source.token,
        onUploadProgress: trackUploads(action),
        onDownloadProgress: trackDownloads(action)
      })

      request.then(response => action.resolve(response.data)).catch(error => {
        action.reject({
          status: get(error, 'response.status', 400),
          data: get(error, 'response.data', null),
          message: get(error, 'message', 'Client error')
        })
      })

      action.onCancel(source.cancel, source)
    }
  }
}
