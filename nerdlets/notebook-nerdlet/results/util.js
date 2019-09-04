// Searches ancestors in an augmented response for which
// condition() returns true. The value returned is determined
// by the supplied accessor()

function searchAncestors(node, condition, accessor) {
  if (condition(node)) {
    return accessor(node)
  }
  if (node.__meta && node.__meta.parent) {
    return searchAncestors(node.__meta.parent, condition, accessor)
  }
  return null
}

export { searchAncestors }
