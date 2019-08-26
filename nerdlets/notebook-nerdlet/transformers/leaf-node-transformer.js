let LeafNodeTransformer =   {
  test: (node) => node.__meta.leaf,
  transform: (node) => node.value
}

export { LeafNodeTransformer }
