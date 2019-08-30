//TODO — move this somewhere it can be re-used
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
