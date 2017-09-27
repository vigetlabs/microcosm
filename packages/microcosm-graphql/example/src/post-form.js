import React from 'react'
import ActionForm from 'microcosm/addons/action-form'

class PostForm extends React.Component {
  onDone(_payload, form) { 
    form.reset()
  }

  onError(error) {
    alert(error)
  }

  render() {
    const { authors, send } = this.props

    return (
      <ActionForm
        action="createPost"
        className="post-form"
        onDone={this.onDone}
        onError={this.onError}
        send={send}
      >
        <div className="field">
          <label htmlFor="title">Title</label>
          <input name="title" />
        </div>
        <div className="field">
          <label htmlFor="author">Author</label>
          <select name="author">
            {authors.map(a => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <footer className="form-footer">
          <button>Create Post</button>
        </footer>
      </ActionForm>
    )
  }
}

export default PostForm
