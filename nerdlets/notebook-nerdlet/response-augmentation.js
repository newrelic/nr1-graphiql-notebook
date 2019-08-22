const {isListType, getNamedType, isLeafType, isNonNullType} = require("graphql/type/definition")
const QueryDocumentContext = require('./query-document-context.js')
import gql from 'graphql-tag'

//TODO: Don't assume this is a Query document (could be mutation, subscription)
export function expandResponse(schema, query, _variables, root) {
  let context = QueryDocumentContext.generate(gql(query))
  root.__typename = schema.getQueryType().name
  return expandNode(null, root, [], schema.getTypeMap(), context)
}

// TODO: Aliases aren't handled yet
function expandNode(parent, node, path, typeMap, context) {
  let typeName = node.__typename
  let type = typeMap[typeName]
  let fields = type.getFields()
  let expandedNode = {
    __meta: {
      typename: typeName,
      type: type, //needed?
      path: path,
      context: QueryDocumentContext.findFieldContext(context, path),
      parent: parent
    }
  }

  Object.entries(node).forEach(([fieldName, fieldValue]) => {
    if (fieldName === "__typename") return
    let field = fields[fieldName]
    let fieldPath = [fieldName, ...path]

    if (isListOfLeaves(field.type)) {
      expandedNode[fieldName] = expandListLeaves(expandedNode, fieldValue, field.type, fieldPath, context)
    } else if (isListOfNodes(field.type)) {
      expandedNode[fieldName] = expandListNodes(expandedNode, fieldValue, field.type, fieldPath, typeMap, context)
    } else if (isDefinitelyLeafType(field.type)) {
      expandedNode[fieldName] = expandLeafNode(expandedNode, fieldValue, field.type, fieldPath, context)
    } else {
      expandedNode[fieldName] = expandNode(expandedNode, fieldValue, fieldPath, typeMap, context)
    }
  })

  return expandedNode
}

function expandListNodes(parent, list, type, path, typeMap, context) {
  let unwrappedType = getNamedType(type)
  let listNode = {
    __meta: {
      type: type,
      of: unwrappedType,
      ofTypeName: unwrappedType.name,
      list: true,
      path: path,
      parent: parent
    }
  }
  listNode.value = list.map((node, i) => expandNode(listNode, node, [i, ...path], typeMap, context))
  return listNode
}

function expandListLeaves(parent, list, type, path, context) {
  let unwrappedType = getNamedType(type)
  let listNode = {
    __meta: {
      type: type,
      of: unwrappedType,
      ofTypeName: unwrappedType.name,
      list: true,
      path: path,
      parent: parent
    }
  }

  listNode.value = list.map((leafNode, i) => expandLeafNode(listNode, leafNode, type, [i, ...path], context))
  return listNode
}

function expandLeafNode(parent, value, type, path, context) {
  let unwrappedType = getNamedType(type)
  return {
    __meta: {
      type: unwrappedType,
      typename: unwrappedType.name,
      leaf: true,
      path: path,
      parent: parent,
      context: QueryDocumentContext.findFieldContext(context, path),
    },
    value: value
  }
}

const isDefinitelyListType = (type) => (isNonNullType(type) && isListType(type.ofType)) || isListType(type)
const isDefinitelyLeafType = (type) => isLeafType(getNamedType(type))
const isListOfLeaves = (type) => isDefinitelyListType(type) && isDefinitelyLeafType(type)
const isListOfNodes = (type) => isDefinitelyListType(type) && !isDefinitelyLeafType(type)
