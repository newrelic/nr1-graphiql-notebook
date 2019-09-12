
const { visit } = require('graphql/language/visitor');

// Modifies the query document AST to produce a simplified
// tree usable during the "augmentation phase", when the
// GraphQL response data is transformed to append additional
// information.
export function generate(queryDoc) {
  return buildContextTree(inlineFragments(queryDoc));
}

// Given a path ["actor", "account", "nrql"], find the `context`
// value of that node in the augmented response. The context property
// includes things like the argument the field was queried with.
export function findFieldContext(contextNode, path) {
  if (Number.isInteger(last(path))) return findFieldContext(contextNode, path.slice(0, -1));
  if (path.length === 0) return contextNode.context || {};
  const [nextField, remainingPath] = pop(path);
  const nextNode = contextNode.selectionSet[nextField];
  return findFieldContext(nextNode, remainingPath);
}

const listToMap = (list, keyAccessor, valueAccessor) => {
  valueAccessor = valueAccessor || (v => v);
  return list.reduce((map, item) => {
    map[keyAccessor(item)] = valueAccessor(item);
    return map;
  }, {});
};

const wrap = value => (Array.isArray(value) ? value : [value]);

const flatten = list => list.reduce((flattened, item) => flattened.concat(wrap(item)), []);

const buildNamedFragmentMap = (queryDoc) => {
  const namedFragments = {};

  visit(queryDoc, {
    FragmentDefinition(node) {
      const fragmentName = node.name.value;
      const fragmentFields = node.selectionSet.selections;
      namedFragments[fragmentName] = fragmentFields;
    }
  });

  return namedFragments;
};

const inlineFragments = (queryDoc) => {
  const namedFragments = buildNamedFragmentMap(queryDoc);
  return visit(queryDoc, {
    enter: {
      FragmentSpread(node) { return namedFragments[node.name.value]; },
      InlineFragment(node) { return node.selectionSet && node.selectionSet.selections; }
    },

    leave: {
      Field(node) {
        if (node.selectionSet) {
          node.selectionSet.selections = flatten(node.selectionSet.selections);
        }
        return node;
      }
    }
  });
};

const buildContextTree = (queryDoc) => {
  return visit(queryDoc, {
    enter: {
      FragmentDefinition() {
        return null;
      }
    },
    leave: {
      Document(node) {
        return {
          ...node.definitions[0],
          context: {}
        }; // TODO too fragile?
      },

      Name(node) {
        return node.value;
      },

      SelectionSet(node) {
        return listToMap(node.selections, ({ name }) => name);
      },

      Argument(node) {
        return {
          name: node.name,
          kind: node.value.kind,
          value: node.value.value
        };
      },

      Field(node) {
        const name = node.alias || node.name;
        return {
          name,
          context: {
            arguments: listToMap(node.arguments, ({ name }) => name)
          },
          selectionSet: node.selectionSet
        };
      }
    }
  });
};

function pop(list) {
  return [last(list), list.slice(0, -1)];
}

function last(list) {
  return list[list.length - 1];
}
