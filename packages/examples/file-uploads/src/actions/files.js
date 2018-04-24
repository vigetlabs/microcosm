import http from 'microcosm-http'

export const uploadFile = http.prepare({ method: 'POST', url: '/files' })
