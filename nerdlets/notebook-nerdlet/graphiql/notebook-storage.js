// Wraps localStorage so we can scope GraphiQL's storage
// requests to a given cell.

const storage = window.localStorage

export default class NotebookStorage {
  constructor(cell) {
    this.storage = window.localStorage
    this.cell = cell
  }

  getItem(itemName) {
    return this.storage.getItem(this.getKey(itemName))
  }

  removeItem(itemName) {
    return this.storage.removeItem(this.getKey(itemName))
  }

  setItem(itemName, value) {
    return this.storage.setItem(this.getKey(itemName), value)
  }

  getKey(key) {
    return `${this.cell}--${key}`
  }
}
