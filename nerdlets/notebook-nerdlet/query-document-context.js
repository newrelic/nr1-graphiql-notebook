
import gql from 'graphql-tag';
const { visit } = require('graphql/language/visitor');

const listToMap = (list, keyAccessor, valueAccessor) => {
  valueAccessor = valueAccessor || ((v) => v)
  return list.reduce((map, item) => {
    map[keyAccessor(item)] = valueAccessor(item)
    return map
  }, {})
}

const wrap = (value) => Array.isArray(value) ? value : [value]

const flatten = (list) => list.reduce((flattened, item) => flattened.concat(wrap(item)), [])

const buildNamedFragmentMap = (queryDoc) => {
  let namedFragments = {}

  visit(queryDoc, {
    FragmentDefinition(node) {
      let fragmentName = node.name.value
      let fragmentFields = node.selectionSet.selections
      namedFragments[fragmentName] = fragmentFields
    }
  })

  return namedFragments
}

const inlineFragments = (queryDoc) => {
  const namedFragments = buildNamedFragmentMap(queryDoc)
  return visit(doc, {
    enter: {
      FragmentSpread(node) { return namedFragments[node.name.value] },
      InlineFragment(node) { return node.selectionSet && node.selectionSet.selections }
    },

    leave: {
      Field(node) {
        if (node.selectionSet) {
          node.selectionSet.selections = flatten(node.selectionSet.selections)
        }
        return node
      },
    }
  })
}


let doc = gql`
query HeroForEpisode($ep: Episode!) {
  hero(episode: $ep) {
    aliased: name
    ... on Droid {
      primaryFunction
    }
    ... PictureFragment
  }
}

fragment PictureFragment on Picture {
  uri(id: 1001)
  width
  height
}
`
console.log(inlineFragments(doc))
// console.log(JSON.stringify(x, null, 2))

  // OperationDefinition(node) {
    //   return {
    //     variables: node.variableDefinitions,
    //     selections: node.selectionSet
    //   }
    // },

    // Document(node) {
    //   return node.definitions[0]
    // },

    // could it be enough to just build a map of <PATHKEY, ARGUMENT>
    // using the Argument visitor? Other things to consider:
    //   - named fragment values some how (maybe an initial visit
    //     pass just to create a map of named fragments)
    //   - variable substitution?
    //   - account for substituting magic var ref strings?
    // don't forget aliases
      // console.log("node", node)
      // console.log("key", key)
      // console.log("parent", parent)
      // console.log("path", path)
      // console.log("ancestors", ancestors)
      // ancestors.forEach((a) => {
      //   console.log(a)
      // })
      // console.log("===============================")
      // Eventually sub value out of variables json here?
