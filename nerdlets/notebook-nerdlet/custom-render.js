import EntityGuidRenderer from './renderers/entity-guid-renderer.js'
import NRQLRenderer from './renderers/nrql-renderer.js'
import { EpochMillisecondsTransformer } from './transformers/epoch-milliseconds.js'
import { LeafTransformer } from './transformers/leaf-transformer.js'

let RENDERERS = [
  EntityGuidRenderer,
  NRQLRenderer
]

let TRANSFORMERS = [
  EpochMillisecondsTransformer,
  LeafTransformer
]

//TODO This logic all feels clunky, it should be simplified
//  - render if custom renderer and stop traversing
//  - else
//  - transform if transformer
//  - traverse
export function renderTree(node, addCell) {
  if (!node.__meta) return node


  let CustomRenderer = RENDERERS.find((renderer) => renderer.test(node))
  if (CustomRenderer) {
    return <CustomRenderer node={node} addCell={addCell}/>
  } else {
    let transformer = TRANSFORMERS.find((transformer) => transformer.test(node))
    let newNode = node
    if (transformer) {
      newNode = transformer.transform({ ...node })
    }
    renderChildren(newNode, addCell)
    return newNode
  }
}

function renderChildren(node, addCell) {
  if (!node.__meta) return
  if (node.__meta.list) {
    node.value = node.value.map((listItem) => renderTree(listItem, addCell))
  } else {
    Object.entries(node).forEach(([field, value]) => {
      node[field] = renderTree(value, addCell)
    })
  }
}
