import { Microcosm } from 'microcosm'
import { Planets } from './domains/planets'

export class Repo extends Microcosm {
  setup() {
    this.addDomain('planets', Planets)
  }
}
