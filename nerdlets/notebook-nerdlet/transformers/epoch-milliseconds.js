let EpochMillisecondsTransformer = {
  test: (node) => node.__meta.typename == "EpochMilliseconds",
  transform: (node) => {
    return new Date(node.value)
  }
}
export { EpochMillisecondsTransformer }
