import React from 'react'
import Form from 'react-jsonschema-form'
import { Presenter } from 'microcosm-dom'
import { Planet, Planets } from '../domains/planets'

export class PlanetForm extends Presenter {
  getModel(repo) {
    return {
      planets: repo.domains.planets.all()
    }
  }

  render() {
    return (
      <div>
        <Form schema={Planet.schema} onSubmit={this.onSubmit.bind(this)} />
        <ul>{this.model.planets.map(p => <li key={p._id}>{p.name}</li>)}</ul>
      </div>
    )
  }

  onSubmit({ formData }) {
    this.repo.push(Planets.create, formData)
  }
}
