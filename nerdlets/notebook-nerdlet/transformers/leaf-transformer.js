let LeafTransformer =   {
  test: (node) => node.__meta.leaf,
  transform: (node) => node.value
}

export { LeafTransformer }
