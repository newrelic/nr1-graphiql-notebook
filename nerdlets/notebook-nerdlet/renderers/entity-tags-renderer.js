import React from 'react';
import { List, ListItem, Button } from 'nr1'
import { normalizeWhitespace } from '../renderer-util.js'
import { searchAncestors } from '../augmentation-util.js'

export default class EntityTagsRenderer extends React.Component {
  static test(node) {
    return node.__meta.list &&
           node.__meta.ofTypeName == "EntityTag" &&
           !node.value.find((tag) => tag.values == undefined || tag.values == null)
  }

  render() {
    let tags = this.props.node.value
    let guid = searchAncestors(this.props.node,
      //too permissive, need to keep track of interfaces and types both
      // to make this easier
      (ancestor) => (ancestor.__meta.context &&
                    ancestor.__meta.context.arguments.guid &&
                    ancestor.__meta.context.arguments.guid.value) ||
                    ancestor.guid && ancestor.guid.value,
      (ancestor) => (ancestor.__meta.context.arguments.guid &&
                    ancestor.__meta.context.arguments.guid.value) ||
                    ancestor.guid && ancestor.guid.value
    )


    return <>
      <List rowHeight={30} style={{display: "inline-block", width: "auto"}}>
        <ListItem key="new-tag">
          {this.renderEntityTagMutationButton(guid)}
        </ListItem>
        {
          this.expandTags(tags).map((tag) => {
            return <ListItem key={`${tag.key}-${tag.value}`}>
              <b style={{color: "#464E4E"}}>{tag.key}</b>={tag.value}
              &nbsp;
              {this.renderEntitySearchButton(tag.key, tag.value)}
              </ListItem>
          })
        }
      </List>
    </>
  }

  expandTags(tags) {
    return flatMap(tags, (tag) => {
      return tag.values.value.map((tagValue) => {
        return {key: tag.key.value, value: tagValue.value}
      })
    })
  }

  renderEntitySearchButton(tagKey, tagValue) {
    let { addCell } = this.props.util
    let suggestedQuery = `
  {
    actor {
      entitySearch(
        queryBuilder: {
          tags: {key: "${tagKey}", value: "${tagValue}"}
        }) {
        query
        results {
          entities {
            name
            guid
          }
        }
      }
    }
  }
  `
    return <Button
        type={Button.TYPE.NORMAL}
        sizeType={Button.SIZE_TYPE.SLIM}
        iconType={Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__NODE}
        onClick={() => {
          addCell({
            query: suggestedQuery,
            notes: normalizeWhitespace(`
            Search for entities tagged with ${tagKey}=${tagValue}.
            The 'entitySearch' field allows you to search entities
            based on specific attributes with a NRQL-like syntax.`)
          })
        }}
      >
        Query for Entities with this tag
      </Button>
  }

  renderEntityTagMutationButton(guid) {
    let { addCell } = this.props.util
    let suggestedQuery = `
mutation {
  taggingAddTagsToEntity(guid: "${guid}", tags: {key: "hello", values: "world"}) {
    errors {
      message
    }
  }
}
  `.trim()
    return <Button
        type={Button.TYPE.NORMAL}
        sizeType={Button.SIZE_TYPE.SLIM}
        iconType={Button.ICON_TYPE.HARDWARE_AND_SOFTWARE__SOFTWARE__NODE}
        onClick={() => {
          addCell({
            query: suggestedQuery,
            notes: 'This mutation will tag the Entity with the key "hello" and the value "world".'
          })
        }}
      >
        Add a tag to this Entity
      </Button>
  }
}



function flatMap(list, fn) {
  return list.reduce((result, element) => {
    return result.concat(fn(element) || [])
  }, [])
}
