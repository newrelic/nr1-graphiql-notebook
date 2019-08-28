import EntityGuidRenderer from './renderers/entity-guid-renderer.js'
import EntityTagsRenderer from './renderers/entity-tags-renderer.js'
import EntityAlertSeverityRenderer from './renderers/entity-alert-severity-renderer.js'
import EpochMillisecondsRenderer from './renderers/epoch-milliseconds-renderer.js'
import NRQLRenderer from './renderers/nrql-renderer.js'
import { LeafNodeTransformer } from './transformers/leaf-node-transformer.js'

let RENDERERS = [
  EpochMillisecondsRenderer,
  EntityAlertSeverityRenderer,
  EntityTagsRenderer,
  NRQLRenderer,
  EntityGuidRenderer
]

let TRANSFORMERS = [
  LeafNodeTransformer
]

//TODO This logic all feels clunky, it should be simplified
// currently —
//  - render if custom renderer and stop traversing
//  - else
//  - transform if transformer
//  - traverse
export function renderTree(node, addCell) {
  if (!node || !node.__meta) return node

  let CustomRenderer = RENDERERS.find((renderer) => renderer.test(node))
  if (CustomRenderer) {
    return <CustomRenderer node={node} addCell={addCell}/>
  } else {
    let transformer = TRANSFORMERS.find((transformer) => transformer.test(node))
    let newNode = node
    if (transformer) {
      newNode = transformer.transform({ ...node })
    }
    newNode = renderChildren(newNode, addCell)
    return newNode
  }
}

function renderChildren(node, addCell) {
  if (!node || !node.__meta) return node
  if (node.__meta.list) {
    return node.value.map((listItem) => renderTree(listItem, addCell))
  } else {
    Object.entries(node).forEach(([field, value]) => {
      node[field] = renderTree(value, addCell)
    })
    return node
  }
}
