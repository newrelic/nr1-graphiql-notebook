const {isListType, getNamedType, isLeafType, isNonNullType} = require("graphql/type/definition")

//TODO: Don't assume this is a Query document (could be mutation, subscription)
export function expandResponse(schema, root) {
  const typeMap = schema.getTypeMap()

  root.__typename = schema.getQueryType().name

  return expandNode(root, typeMap)
}

// TODO: Aliases aren't handled yet
function expandNode(node, typeMap) {
  console.log(node)
  let typeName = node.__typename
  let type = typeMap[typeName]
  let fields = type.getFields()

  let expandedNode = {
    __typename: typeName,
    __type: type
  }
  Object.entries(node).forEach(([fieldName, fieldValue]) => {
    if (fieldName === "__type") return
    if (fieldName === "__typename") return
    let field = fields[fieldName]

    if (isListOfLeaves(field.type)) {
      expandedNode[fieldName] = expandListLeaves(fieldName, fieldValue, field.type)
    } else if (isListOfNodes(field.type)) {
      expandedNode[fieldName] = expandListNodes(fieldName, fieldValue, field.type, typeMap)
    } else if (isDefinitelyLeafType(field.type)) {
      expandedNode[fieldName] = expandLeafNode(fieldName, fieldValue, field.type)
    } else {
      expandedNode[fieldName] = expandNode(fieldValue, typeMap)
    }
  })

  return expandedNode
}

function expandListNodes(fieldName, list, type, typeMap) {
  return {
    __type: type,
    __list: true,
    __of: getNamedType(type),
    name: fieldName,
    value: list.map((node) => expandNode(node, typeMap))
  }
}

function expandListLeaves(fieldName, list, type) {
  return {
    __type: type,
    __list: true,
    __of: getNamedType(type),
    name: fieldName,
    value: list.map((leafNode) => expandLeafNode(null, leafNode, type))
  }
}

function expandLeafNode(name, value, type) {
  let unwrappedType = getNamedType(type)
  return {
    name: name,
    value: value,
    leaf: true,
    __typename: unwrappedType.name,
    __type: unwrappedType
  }
}

function isListOfLeaves(type) {
  return isDefinitelyListType(type) && isDefinitelyLeafType(type)
}

function isListOfNodes(type) {
  return !isListOfLeaves(type) && isDefinitelyListType(type)
}

function isDefinitelyListType(type) {
  return (isNonNullType(type) && isListType(type.ofType)) ||
         isListType(type)
}

function isDefinitelyLeafType(type) {
  return isLeafType(getNamedType(type))
}
