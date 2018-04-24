import React from 'react'
import { uploadFile } from '../actions/files'
import { Subject } from 'microcosm'
import { Presenter, ActionForm } from 'microcosm-dom'
import { Progress } from './progress'

function asFormData(form) {
  return { data: new FormData(form) }
}

export class FileUploader extends Presenter {
  state = {
    status: 'inactive',
    file: undefined
  }

  queue = new Subject()

  render() {
    let { status, file } = this.state

    return (
      <ActionForm
        action={uploadFile}
        serializer={asFormData}
        queue={this.queue}
        onSend={this.trackProgress}
      >
        <Progress status={status} file={file} onCancel={this.queue.clear} />

        <label htmlFor="files">Upload a file</label>
        <input id="file" multiple name="files" type="file" />

        <footer>
          <button>Upload</button>
        </footer>
      </ActionForm>
    )
  }

  trackProgress = action => {
    action.every(iteration =>
      this.setState({ status: iteration.status, file: iteration.payload })
    )
  }
}
