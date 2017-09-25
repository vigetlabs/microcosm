import React from 'react'
import DOM from 'react-dom'
import Microcosm from 'microcosm'
import ActionForm from 'microcosm/addons/action-form'
import Presenter from 'microcosm/addons/presenter'
import http from 'microcosm-http'

let repo = new Microcosm()

repo.addDomain('files', {
  actions: {
    uploadFile: http.prepare({ method: 'post', url: '/files' })
  }
})

class FileUploader extends Presenter {
  state = {
    status: 'inactive',
    payload: null
  }

  onNext = ({ status, payload }) => {
    this.setState({ status, payload })
  }

  serialize(form) {
    return { data: new FormData(form) }
  }

  render() {
    const { status, payload } = this.state

    if (status === 'update') {
      return (
        <div>
          <p>Your files are uploading...</p>
          <progress value={payload.progress} />
        </div>
      )
    }

    return (
      <ActionForm
        action="uploadFile"
        onNext={this.onNext}
        serializer={this.serialize}
      >
        {status === 'reject' ? (
          <p className="msg error">{payload.message}</p>
        ) : null}

        {status === 'resolve' ? (
          <p className="msg success">Files sent!</p>
        ) : null}

        <label htmlFor="files">Upload a file</label>
        <input id="file" multiple name="files" type="file" />

        <footer>
          <button>Upload</button>
        </footer>
      </ActionForm>
    )
  }
}

DOM.render(<FileUploader repo={repo} />, document.getElementById('app'))
