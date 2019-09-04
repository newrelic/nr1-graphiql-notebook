import EntityGuidRenderer from './renderers/entity-guid-renderer.js'
import EntityTagsRenderer from './renderers/entity-tags-renderer.js'
import EntityAlertSeverityRenderer from './renderers/entity-alert-severity-renderer.js'
import EpochMillisecondsRenderer from './renderers/epoch-milliseconds-renderer.js'
import NRQLRenderer from './renderers/nrql-renderer.js'

let RENDERERS = [
  EpochMillisecondsRenderer,
  EntityAlertSeverityRenderer,
  EntityTagsRenderer,
  NRQLRenderer,
  EntityGuidRenderer
]

export function renderTree(node, util) {
  if (!node || !node.__meta) return node

  let CustomRenderer = RENDERERS.find((renderer) => renderer.test(node))
  if (CustomRenderer) {
    return {__custom: <CustomRenderer node={node} util={util}/>, ...node}
  } else if (node.__meta.leaf) {
    return node.value
  } else {
    return renderChildren(node, util)
  }
}

function renderChildren(node, util) {
  if (!node || !node.__meta) return node
  if (node.__meta.list) {
    return node.value.map((listItem) => renderTree(listItem, util))
  } else {
    Object.entries(node).forEach(([field, value]) => {
      node[field] = renderTree(value, util)
    })
    return node
  }
}
