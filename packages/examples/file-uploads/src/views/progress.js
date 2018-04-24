import React from 'react'

function Loading({ file, onCancel }) {
  return (
    <div>
      <p>Your files are uploading...</p>
      <progress value={file.progress} />
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </div>
  )
}

export function Progress({ status, file, onCancel }) {
  switch (status) {
    case 'next':
      return <Loading file={file} onCancel={onCancel} />
    case 'error':
      return <p className="msg error">{file.message}</p>
    case 'complete':
      return <p className="msg success">Files sent!</p>
    case 'cancel':
      return <p className="msg error">File upload cancelled</p>
    default:
      return null
  }
}
