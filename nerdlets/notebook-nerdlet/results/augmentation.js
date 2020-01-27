import gql from 'graphql-tag';

const {
  isListType,
  getNamedType,
  isLeafType,
  isNonNullType
} = require('graphql/type/definition');
const QueryDocumentContext = require('./query-document-context.js');

// Oh dear, what's all this?
// To provide "custom renderers" with enough context to do interesting things
// we need the data returned by NerdGraph to be augmented. For example...
//  * We want to mark leaf nodes (scalars) with their typename and leaf status
//  * Lists (arrays) should be expanded to be objects with properties that
//    tell us about what they're lists _of_
//  * Arguments in the query document sent to NerdGraph are valuable bits of information
//    so they should be included with the data corresponding to that field
//
// To achieve this, the JSON results of an introspection query, the AST of the
// original query document, and the data itself have to be traversed and merged.

// TODO: Don't assume this is a Query document (could be mutation, subscription)
export function expandResponse(schema, query, _variables, root) {
  // This simplified version of the query document allows us to
  // attach things like field arguments to the final, augmented response data
  const context = QueryDocumentContext.generate(gql(query));
  let operationType;

  switch (context.operation) {
    case 'mutation':
      operationType = schema.getMutationType().name;
      break;
    case 'query':
      operationType = schema.getQueryType().name;
      break;
    case 'subscription':
      operationType = schema.getSubscriptionType().name;
      break;
  }

  root.__typename = operationType;
  return expandNode(null, null, root, [], schema.getTypeMap(), context);
}

// TODO: Aliases aren't handled yet but that shouldn't be hard.
function expandNode(parent, currentFieldName, node, path, typeMap, context) {
  if (node === null) return null;
  const typeName = node.__typename;
  const type = typeMap[typeName];
  const fields = type.getFields();
  const expandedNode = {
    __meta: {
      typename: typeName,
      fieldName: currentFieldName,
      path: path,
      context: QueryDocumentContext.findFieldContext(context, path),
      parent: parent
    }
  };

  Object.entries(node).forEach(([fieldName, fieldValue]) => {
    if (fieldName === '__typename') return;
    const field = fields[fieldName];
    const fieldPath = [fieldName, ...path];

    if (isListOfLeaves(field.type)) {
      expandedNode[fieldName] = expandListLeaves(
        expandedNode,
        fieldName,
        fieldValue,
        field.type,
        fieldPath,
        context
      );
    } else if (isListOfNodes(field.type)) {
      expandedNode[fieldName] = expandListNodes(
        expandedNode,
        fieldName,
        fieldValue,
        field.type,
        fieldPath,
        typeMap,
        context
      );
    } else if (isDefinitelyLeafType(field.type)) {
      expandedNode[fieldName] = expandLeafNode(
        expandedNode,
        fieldName,
        fieldValue,
        field.type,
        fieldPath,
        context
      );
    } else {
      expandedNode[fieldName] = expandNode(
        expandedNode,
        fieldName,
        fieldValue,
        fieldPath,
        typeMap,
        context
      );
    }
  });

  return expandedNode;
}

function expandListNodes(
  parent,
  fieldName,
  list,
  type,
  path,
  typeMap,
  context
) {
  const unwrappedType = getNamedType(type);
  const listNode = {
    __meta: {
      fieldName: fieldName,
      ofTypeName: unwrappedType.name,
      list: true,
      path: path,
      parent: parent
    }
  };
  listNode.value = list.map((node, i) =>
    expandNode(listNode, i, node, [i, ...path], typeMap, context)
  );
  return listNode;
}

function expandListLeaves(parent, fieldName, list, type, path, context) {
  const unwrappedType = getNamedType(type);
  const listNode = {
    __meta: {
      fieldName: fieldName,
      ofTypeName: unwrappedType.name,
      list: true,
      path: path,
      parent: parent
    }
  };

  listNode.value = list.map((leafNode, i) =>
    expandLeafNode(listNode, i, leafNode, type, [i, ...path], context)
  );
  return listNode;
}

function expandLeafNode(parent, fieldName, value, type, path, context) {
  const unwrappedType = getNamedType(type);
  return {
    __meta: {
      typename: unwrappedType.name,
      fieldName: fieldName,
      leaf: true,
      path: path,
      parent: parent,
      context: QueryDocumentContext.findFieldContext(context, path)
    },
    value: value
  };
}

const isDefinitelyListType = type =>
  (isNonNullType(type) && isListType(type.ofType)) || isListType(type);
const isDefinitelyLeafType = type => isLeafType(getNamedType(type));
const isListOfLeaves = type =>
  isDefinitelyListType(type) && isDefinitelyLeafType(type);
const isListOfNodes = type =>
  isDefinitelyListType(type) && !isDefinitelyLeafType(type);
