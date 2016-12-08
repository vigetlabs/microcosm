/**
 * Basic prototypal inheritence
 */
export default function inherit (Child, Ancestor) {
  Child.__proto__ = Ancestor

  Child.prototype = Object.create(Ancestor.prototype)

  Child.prototype.constructor = Child
}
